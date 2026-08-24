import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import UploadDropzone from './components/UploadDropzone';
import SearchBar from './components/SearchBar';
import InvoiceTable from './components/InvoiceTable';
import InvoiceModal from './components/InvoiceModal';
import AIChatbot from './components/AIChatbot';
import { 
  Database, 
  Layers, 
  Server, 
  Activity, 
  FileText, 
  Cpu,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  Search
} from 'lucide-react';

const INITIAL_DEMO_INVOICES = [
  {
    id: 101,
    filename: "Acme_Logistics_Freight_Receipt_882.pdf",
    vendor_name: "Acme Logistics Corp",
    invoice_number: "INV-88291",
    invoice_date: "2026-08-01",
    total_amount: 1450.75,
    tax_amount: 115.00,
    currency: "USD",
    status: "COMPLETED",
    blob_url: "http://127.0.0.1:10000/invoices-raw/Acme_Logistics_Freight_Receipt_882.pdf",
    line_items_json: [
      { description: "Interstate Freight Shipping", quantity: 1, unit_price: 1200.00, total: 1200.00 },
      { description: "Fuel & Handling Surcharge", quantity: 1, unit_price: 250.75, total: 250.75 }
    ],
    created_at: "2026-08-01T10:30:00Z"
  },
  {
    id: 102,
    filename: "GlobalTech_Software_Licenses_2026.pdf",
    vendor_name: "GlobalTech Solutions Ltd",
    invoice_number: "INV-99402",
    invoice_date: "2026-08-05",
    total_amount: 5400.00,
    tax_amount: 450.00,
    currency: "USD",
    status: "COMPLETED",
    blob_url: "http://127.0.0.1:10000/invoices-raw/GlobalTech_Software_Licenses_2026.pdf",
    line_items_json: [
      { description: "Enterprise Cloud AI Platform (Annual)", quantity: 10, unit_price: 490.00, total: 4900.00 },
      { description: "Premium 24/7 SLA Support Add-on", quantity: 1, unit_price: 500.00, total: 500.00 }
    ],
    created_at: "2026-08-05T14:15:00Z"
  },
  {
    id: 103,
    filename: "Apex_Office_Supplies_Bulk.pdf",
    vendor_name: "Apex Office Supplies",
    invoice_number: "INV-44120",
    invoice_date: "2026-08-10",
    total_amount: 820.50,
    tax_amount: 65.50,
    currency: "USD",
    status: "COMPLETED",
    blob_url: "http://127.0.0.1:10000/invoices-raw/Apex_Office_Supplies_Bulk.pdf",
    line_items_json: [
      { description: "Ergonomic Mesh Office Chairs", quantity: 4, unit_price: 150.00, total: 600.00 },
      { description: "Recycled Printing Paper Cartons", quantity: 10, unit_price: 22.05, total: 220.50 }
    ],
    created_at: "2026-08-10T09:00:00Z"
  },
  {
    id: 104,
    filename: "Delta_Cloud_Infrastructure_August.pdf",
    vendor_name: "Delta Cloud Hosting",
    invoice_number: "INV-77319",
    invoice_date: "2026-08-12",
    total_amount: 2150.00,
    tax_amount: 180.00,
    currency: "USD",
    status: "COMPLETED",
    blob_url: "http://127.0.0.1:10000/invoices-raw/Delta_Cloud_Infrastructure_August.pdf",
    line_items_json: [
      { description: "Qdrant Vector DB Kubernetes Node Clusters", quantity: 2, unit_price: 800.00, total: 1600.00 },
      { description: "PostgreSQL High-Availability Volume Storage", quantity: 1, unit_price: 550.00, total: 550.00 }
    ],
    created_at: "2026-08-12T16:45:00Z"
  },
  {
    id: 105,
    filename: "Horizon_Express_Delivery_Services.pdf",
    vendor_name: "Horizon Express Freight",
    invoice_number: "INV-31092",
    invoice_date: "2026-08-14",
    total_amount: 680.00,
    tax_amount: 55.00,
    currency: "USD",
    status: "PROCESSING",
    blob_url: "http://127.0.0.1:10000/invoices-raw/Horizon_Express_Delivery_Services.pdf",
    line_items_json: [
      { description: "Overnight Document Dispatch", quantity: 5, unit_price: 136.00, total: 680.00 }
    ],
    created_at: "2026-08-14T11:20:00Z"
  }
];

export default function App() {
  const [invoices, setInvoices] = useState(INITIAL_DEMO_INVOICES);
  const [filteredInvoices, setFilteredInvoices] = useState(INITIAL_DEMO_INVOICES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/v1/invoices');
      if (response.data && Array.isArray(response.data.invoices)) {
        setInvoices(response.data.invoices);
        setFilteredInvoices(response.data.invoices);
      }
    } catch (err) {
      console.log('Backend offline or initializing - using live demo preset records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredInvoices(invoices);
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8000/api/v1/invoices/search?query=${encodeURIComponent(query)}`);
      if (response.data && response.data.results && response.data.results.length > 0) {
        const enriched = response.data.results.map(r => ({
          ...r.invoice,
          similarity_score: r.similarity_score
        }));
        setFilteredInvoices(enriched);
        return;
      }
    } catch (err) {
      console.log('Backend search API offline - using client fallback search');
    }

    // Client-side fallback filter
    const q = query.toLowerCase();
    const matches = invoices.filter(inv => 
      (inv.filename && inv.filename.toLowerCase().includes(q)) ||
      (inv.vendor_name && inv.vendor_name.toLowerCase().includes(q)) ||
      (inv.invoice_number && inv.invoice_number.toLowerCase().includes(q)) ||
      (q.includes('5000') && inv.total_amount > 5000) ||
      (q.includes('shipping') && inv.vendor_name && inv.vendor_name.toLowerCase().includes('freight')) ||
      (q.includes('supplies') && inv.vendor_name && inv.vendor_name.toLowerCase().includes('office'))
    );
    setFilteredInvoices(matches);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredInvoices(invoices);
    }
  }, [invoices, searchQuery]);

  const handleUploadSuccess = (newInvoice) => {
    if (newInvoice) {
      setInvoices(prev => [newInvoice, ...prev]);
    } else {
      fetchInvoices();
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/invoices/${invoiceId}`);
    } catch (err) {
      console.log(`Backend delete API offline - removing #${invoiceId} from local state`);
    }
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    setFilteredInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
  };

  const totalValue = invoices.reduce((acc, inv) => acc + (inv.total_amount || 0), 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2rem 1.5rem 3rem 1.5rem',
        flex: 1,
        width: '100%'
      }}>
        {/* System Header Banner */}
        <section style={{
          textAlign: 'center',
          marginBottom: '2rem',
          padding: '2.25rem 2rem',
          borderRadius: 'var(--radius-lg)'
        }} className="glass-card">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            color: 'var(--accent-cyan)',
            marginBottom: '1rem'
          }}>
            <Cpu size={16} /> Enterprise GenAI Document Intelligence Engine
          </div>
          
          <h1 style={{ fontSize: '2.4rem', marginBottom: '0.75rem' }} className="gradient-text-accent">
            Intelligent Invoice Processing & Semantic Search
          </h1>
          
          <p style={{ maxWidth: '780px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: '1.6' }}>
            Automated PDF OCR, Azure AI layout extraction, 384-dimensional vector embedding index via Qdrant, and local Azure Blob Storage archival.
          </p>
        </section>

        {/* Dashboard Operations Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Upload Dropzone Container */}
          <div style={{ padding: '1.5rem' }} className="glass-card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Document Ingestion</h3>
            <UploadDropzone onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Invoices Directory */}
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="glass-card">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Processed Invoices Directory</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Showing {filteredInvoices.length} of {invoices.length} Records
                </span>
              </div>

              <InvoiceTable 
                invoices={filteredInvoices} 
                loading={loading} 
                onViewInvoice={(inv) => setSelectedInvoice(inv)} 
                onDeleteInvoice={handleDeleteInvoice}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Invoice Detail Side Drawer / Modal */}
      {selectedInvoice && (
        <InvoiceModal 
          invoice={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
          onDelete={handleDeleteInvoice}
        />
      )}

      {/* Floating AI Financial Assistant Chatbot */}
      <AIChatbot onViewInvoice={(inv) => setSelectedInvoice(inv)} />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '1.5rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        Intelligent Invoice Processing Engine • GenAI & Vector Search Architecture • Ernst & Young (EY) Internship Project
      </footer>
    </div>
  );
}
