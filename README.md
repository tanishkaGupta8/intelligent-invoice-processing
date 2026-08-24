# Intelligent Invoice Processing & Semantic Search Engine

An end-to-end GenAI system built with **FastAPI**, **React + Vite**, **PostgreSQL**, **Qdrant Vector DB**, and **Azurite Azure Blob Storage Emulator**.

---

## 🌟 Key Features
- **Decoupled Document Ingestion**: Store raw PDFs in local Azure Blob Storage, structured tabular metadata in PostgreSQL, and semantic dense vector embeddings in Qdrant.
- **Multimodal OCR Extraction**: Extract invoice text via PyPDF for native digital PDFs with fallback to Tesseract OCR for scanned document images.
- **GenAI Structuring**: Extract vendor names, invoice numbers, line items, monetary amounts, tax, and dates into structured Pydantic models.
- **Natural Language Vector Search**: Perform semantic queries (e.g., *"office supplies from last month greater than $5000"*) over vector indices.
- **Modern Glassmorphic UI**: High-end dark theme dashboard with real-time processing indicators, search filter chips, and side-by-side document preview drawers.

---

## 🏗️ Repository Layout
- `/backend`: Python FastAPI application, database schemas, vector indexing & extraction services.
- `/frontend`: React + Vite single page application with modern glassmorphism design tokens.
- `/docs`: Architectural diagrams, API contracts, and implementation guides.
- `/sample_invoices`: Test PDF documents for system verification.

---

## 🚀 Quick Start (Week 1 Day 1 Setup)
1. Backend setup:
   ```bash
   cd backend
   python -m venv venv
   # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
2. Frontend setup:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
