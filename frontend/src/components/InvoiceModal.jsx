import React from 'react';
import { 
  X, 
  FileText, 
  Calendar, 
  Building2, 
  DollarSign, 
  Layers, 
  Download, 
  CheckCircle2, 
  ExternalLink,
  Table,
  Cpu,
  Trash2
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function InvoiceModal({ invoice, onClose, onDelete }) {
  if (!invoice) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 15, 0.82)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div 
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-glow)',
          boxShadow: 'var(--shadow-glow)',
          padding: '2rem',
          position: 'relative',
          background: 'rgba(15, 22, 36, 0.95)'
        }}
      >
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <div style={{
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary-500)'
              }}>
                <FileText size={22} />
              </div>
              <h2 style={{ fontSize: '1.4rem' }} className="gradient-text">
                {invoice.filename}
              </h2>
              <StatusBadge status={invoice.status} />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Document ID: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>#{invoice.id}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Key Extracted Details Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}>
          <div style={{ padding: '1rem' }} className="glass-card">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Building2 size={14} color="var(--accent-cyan)" /> Vendor Name
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
              {invoice.vendor_name || 'Unextracted'}
            </div>
          </div>

          <div style={{ padding: '1rem' }} className="glass-card">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FileText size={14} color="var(--accent-purple)" /> Invoice Number
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>
              {invoice.invoice_number || 'N/A'}
            </div>
          </div>

          <div style={{ padding: '1rem' }} className="glass-card">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} color="var(--accent-amber)" /> Invoice Date
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
              {invoice.invoice_date || 'N/A'}
            </div>
          </div>

          <div style={{ padding: '1rem' }} className="glass-card">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <DollarSign size={14} color="var(--accent-emerald)" /> Total Amount
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              {invoice.currency || 'USD'} {invoice.total_amount ? invoice.total_amount.toLocaleString() : '0.00'}
            </div>
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
            <Table size={16} color="var(--primary-500)" /> Extracted Line Items
          </h4>
          <div style={{ overflowX: 'auto', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items_json && Array.isArray(invoice.line_items_json) && invoice.line_items_json.length > 0 ? (
                  invoice.line_items_json.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{item.description}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {invoice.currency || 'USD'} {item.unit_price ? item.unit_price.toLocaleString() : '0.00'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                        {invoice.currency || 'USD'} {item.total ? item.total.toLocaleString() : '0.00'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                      No detailed itemized line items extracted for this document.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem'
        }}>
          <a
            href={invoice.id ? `http://localhost:8000/api/v1/invoices/${invoice.id}/download` : (invoice.blob_url || '#')}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none'
            }}
          >
            <Download size={14} /> Download Original PDF
          </a>

          {onDelete && (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete invoice #${invoice.id}?`)) {
                  onDelete(invoice.id);
                  onClose();
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                color: 'var(--accent-rose)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
              color: '#fff',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
