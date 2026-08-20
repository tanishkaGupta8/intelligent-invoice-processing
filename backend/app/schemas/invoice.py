from datetime import datetime, date
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict

# Base schema shared properties
class InvoiceBase(BaseModel):
    filename: str
    vendor_name: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[date] = None
    total_amount: Optional[float] = None
    tax_amount: Optional[float] = None
    currency: Optional[str] = "USD"
    status: Optional[str] = "PENDING"

# Response Schema returned by endpoints
class InvoiceResponse(InvoiceBase):
    id: int
    blob_url: Optional[str] = None
    raw_text: Optional[str] = None
    line_items_json: Optional[Any] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Paginated response list schema
class InvoiceListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    invoices: List[InvoiceResponse]
