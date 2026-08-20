import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Date, Text, JSON
from app.database import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String(255), nullable=False)
    blob_url = Column(String(512), nullable=True)
    
    # LLM Key-Value Extracted Structured Metadata
    vendor_name = Column(String(255), index=True, nullable=True)
    invoice_number = Column(String(100), index=True, nullable=True)
    invoice_date = Column(Date, nullable=True)
    total_amount = Column(Float, nullable=True)
    tax_amount = Column(Float, nullable=True)
    currency = Column(String(10), default="USD", nullable=True)
    
    # Ingestion & Extraction Details
    status = Column(String(50), default="PENDING", index=True)  # PENDING, PROCESSING, COMPLETED, FAILED
    raw_text = Column(Text, nullable=True)
    line_items_json = Column(JSON, nullable=True)  # Structured array of line items: [{description, qty, unit_price, total}]
    
    # Audit Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Invoice(id={self.id}, filename='{self.filename}', vendor='{self.vendor_name}', amount={self.total_amount}, status='{self.status}')>"
