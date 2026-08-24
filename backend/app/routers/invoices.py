from datetime import datetime, date
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Body, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.invoice import Invoice
from app.schemas.invoice import InvoiceResponse, InvoiceListResponse
from app.services.azure_blob import blob_service
from app.services.extractor import extractor_service
from app.services.vector_service import vector_service

router = APIRouter(
    prefix="/api/v1/invoices",
    tags=["Invoices"]
)

@router.post("/upload", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def upload_invoice(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db)
):
    """
    Accept PDF upload, archive file in Azure Blob Storage (Azurite),
    create database record with status tracking, run metadata extraction,
    and index vector embeddings asynchronously in Qdrant Vector DB.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid format. Only PDF files (.pdf) are supported."
        )

    file_bytes = await file.read()

    # Step 1: Upload raw binary stream to Azure Blob Storage / Local fallback
    try:
        blob_url = blob_service.upload_file(file_bytes, file.filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file to Blob Storage: {str(e)}"
        )

    # Step 2: Register initial record in PostgreSQL database with status PROCESSING
    db_invoice = Invoice(
        filename=file.filename,
        blob_url=blob_url,
        status="PROCESSING"
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)

    # Step 3: Run Document Intelligence extraction pipeline
    try:
        extracted = extractor_service.extract_invoice_data(file_bytes, file.filename)
        
        db_invoice.vendor_name = extracted.get("vendor_name")
        db_invoice.invoice_number = extracted.get("invoice_number")
        
        raw_date = extracted.get("invoice_date")
        if isinstance(raw_date, str):
            try:
                db_invoice.invoice_date = datetime.strptime(raw_date, "%Y-%m-%d").date()
            except Exception:
                db_invoice.invoice_date = None
        elif isinstance(raw_date, date):
            db_invoice.invoice_date = raw_date
        else:
            db_invoice.invoice_date = None

        db_invoice.total_amount = extracted.get("total_amount")
        db_invoice.tax_amount = extracted.get("tax_amount")
        db_invoice.currency = extracted.get("currency", "USD")
        db_invoice.po_number = extracted.get("po_number")
        db_invoice.raw_text = extracted.get("raw_text")
        db_invoice.line_items_json = extracted.get("line_items")
        db_invoice.status = "COMPLETED"
    except Exception as ex:
        db_invoice.status = "FAILED"

    db.commit()
    db.refresh(db_invoice)

    # Step 4: Schedule asynchronous Qdrant vector indexing background task
    if db_invoice.status == "COMPLETED" and db_invoice.raw_text:
        payload = {
            "invoice_id": db_invoice.id,
            "filename": db_invoice.filename,
            "vendor_name": db_invoice.vendor_name,
            "total_amount": db_invoice.total_amount,
            "invoice_date": str(db_invoice.invoice_date) if db_invoice.invoice_date else None
        }
        background_tasks.add_task(
            vector_service.upsert_invoice_vector,
            db_invoice.id,
            db_invoice.raw_text,
            payload
        )

    return db_invoice


@router.get("", response_model=InvoiceListResponse)
def list_invoices(
    skip: int = Query(0, ge=0, description="Records to skip for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Max records per page"),
    db: Session = Depends(get_db)
):
    """
    Returns paginated list of invoices stored in PostgreSQL database.
    """
    total = db.query(Invoice).count()
    invoices = db.query(Invoice).order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()
    
    page = (skip // limit) + 1 if limit > 0 else 1

    return InvoiceListResponse(
        total=total,
        page=page,
        page_size=limit,
        invoices=invoices
    )


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice_by_id(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    """
    Returns single invoice details by database ID.
    """
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with ID {invoice_id} not found."
        )
    return invoice


@router.get("/{invoice_id}/download")
def download_invoice_pdf(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    """
    Download raw PDF document bytes from Azure Blob Storage or local fallback.
    """
    from fastapi import Response

    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with ID {invoice_id} not found."
        )

    try:
        file_bytes = blob_service.download_file(invoice.filename)
        return Response(
            content=file_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"inline; filename={invoice.filename}"}
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"PDF file '{invoice.filename}' not found in storage."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve file from storage: {str(e)}"
        )


@router.post("/search")
def search_invoices(
    query: str = Query(..., min_length=2, description="Natural language search query"),
    limit: int = Query(10, ge=1, le=50, description="Max search results"),
    score_threshold: float = Query(0.35, ge=0.0, le=1.0, description="Min Cosine similarity score"),
    db: Session = Depends(get_db)
):
    """
    STRICT SEMANTIC VECTOR SEARCH:
    Executes dense vector similarity search exclusively over Qdrant Vector DB
    (384-dimensional embeddings generated via SentenceTransformers all-MiniLM-L6-v2).
    PostgreSQL is strictly used to retrieve metadata details & blob storage URLs for matching vector IDs.
    """
    vector_hits = vector_service.search_similar_invoices(
        query=query,
        limit=limit,
        score_threshold=score_threshold
    )

    if not vector_hits:
        return {
            "query": query,
            "total_matches": 0,
            "search_mode": "strict_qdrant_semantic_vector_search",
            "results": []
        }

    # Retrieve PostgreSQL metadata & blob storage path strictly for matching vector IDs
    results = []
    for hit in vector_hits:
        invoice_id = hit["invoice_id"]
        inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if inv:
            inv_resp = InvoiceResponse.model_validate(inv)
            inv_resp.download_url = f"http://localhost:8000/api/v1/invoices/{inv.id}/download"
            results.append({
                "similarity_score": hit["score"],
                "invoice": inv_resp
            })

    return {
        "query": query,
        "total_matches": len(results),
        "search_mode": "strict_qdrant_semantic_vector_search",
        "results": results
    }


@router.delete("/{invoice_id}", status_code=status.HTTP_200_OK)
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    """
    Deletes invoice record from PostgreSQL database, removes vector point from Qdrant,
    and purges raw PDF file from Azurite Blob Storage / local disk.
    """
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with ID {invoice_id} not found."
        )

    # 1. Delete vector point from Qdrant
    vector_service.delete_invoice_vector(invoice_id)

    # 2. Delete raw PDF file from Azurite / Local storage
    if invoice.filename:
        blob_service.delete_file(invoice.filename)

    # 3. Delete relational row from PostgreSQL
    db.delete(invoice)
    db.commit()

    return {
        "status": "success",
        "message": f"Invoice #{invoice_id} ('{invoice.filename}') successfully deleted from PostgreSQL, Qdrant Vector DB, and Blob Storage."
    }


@router.post("/chat")
def chat_with_invoice_ai(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    RAG-Powered AI Financial Assistant Chatbot Endpoint:
    Receives user natural language queries, performs Qdrant 384-d Cosine similarity search,
    synthesizes a conversational response, and returns referenced invoice metadata cards.
    """
    user_message = payload.get("message", "").strip()
    if not user_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message field cannot be empty."
        )

    # 1. Perform Qdrant Vector DB Semantic Search
    vector_hits = vector_service.search_similar_invoices(
        query=user_message,
        limit=5,
        score_threshold=0.3
    )

    if not vector_hits:
        # Fallback to general AI assistant guidance if vector search returns 0 hits
        all_count = db.query(Invoice).count()
        return {
            "query": user_message,
            "response": f"I searched your vector index for **'{user_message}'**, but didn't find any relevant invoices above the similarity threshold. Currently, you have **{all_count} invoices** indexed. Try asking about specific vendor names (e.g. 'Acme Logistics'), document types, or total amounts!",
            "matches_found": 0,
            "referenced_invoices": []
        }

    # 2. Retrieve PostgreSQL metadata for matching vector hits
    referenced = []
    total_val = 0.0
    for hit in vector_hits:
        inv_id = hit["invoice_id"]
        inv = db.query(Invoice).filter(Invoice.id == inv_id).first()
        if inv:
            inv_resp = InvoiceResponse.model_validate(inv)
            inv_resp.download_url = f"http://localhost:8000/api/v1/invoices/{inv.id}/download"
            referenced.append({
                "similarity_score": hit["score"],
                "invoice": inv_resp
            })
            total_val += (inv.total_amount or 0.0)

    top_vendor = referenced[0]["invoice"].vendor_name if referenced else "Invoice Vendor"
    top_score = round(referenced[0]["similarity_score"] * 100, 1) if referenced else 0.0

    # 3. Synthesize conversational AI response
    ai_response = (
        f"I retrieved **{len(referenced)} relevant invoice{'s' if len(referenced) > 1 else ''}** "
        f"from your Qdrant vector index matching **'{user_message}'** (up to **{top_score}% vector match**). "
        f"Top vendor: **{top_vendor}** | Total Value: **${total_val:,.2f} USD**."
    )

    return {
        "query": user_message,
        "response": ai_response,
        "matches_found": len(referenced),
        "referenced_invoices": referenced
    }





