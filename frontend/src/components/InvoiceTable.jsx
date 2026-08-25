import React, { useState } from 'react';
import { FileText, Eye, Download, Calendar, DollarSign, ArrowUpDown, Sparkles, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function InvoiceTable({ invoices = [], loading = false, onViewInvoice, onDeleteInvoice }) {
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedInvoices = [...invoices].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'total_amount') {
      aVal = a.total_amount || 0;
      bVal = b.total_amount || 0;
    } else if (sortField === 'vendor_name') {
      aVal = (a.vendor_name || '').toLowerCase();
      bVal = (b.vendor_name || '').toLowerCase();
    } else if (sortField === 'invoice_date') {
      aVal = a.invoice_date || '';
      bVal = b.invoice_date || '';
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) {
    return (
      <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading invoices directory...
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        background: 'var(--bg-glass)',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--border-color)',
        color: 'var(--text-muted)'
      }}>
        <FileText size={40} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
        <h4 style={{ marginBottom: '0.25rem', color: 'var(--text-main)' }}>No Invoices Found</h4>
        <p style={{ fontSize: '0.85rem' }}>Upload a PDF invoice or adjust search filters to view records.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <th style={{ padding: '0.85rem 1rem' }}>ID</th>
            <th style={{ padding: '0.85rem 1rem' }}>Document</th>
            <th 
              onClick={() => handleSort('vendor_name')}
              style={{ padding: '0.85rem 1rem', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                Vendor <ArrowUpDown size={12} />
              </div>
            </th>
            <th style={{ padding: '0.85rem 1rem' }}>Invoice #</th>
            <th 
              onClick={() => handleSort('invoice_date')}
              style={{ padding: '0.85rem 1rem', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                Date <ArrowUpDown size={12} />
              </div>
            </th>
            <th 
              onClick={() => handleSort('total_amount')}
              style={{ padding: '0.85rem 1rem', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                Total Amount <ArrowUpDown size={12} />
              </div>
            </th>
            <th style={{ padding: '0.85rem 1rem' }}>Status</th>
            <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedInvoices.map((inv) => (
            <tr key={inv.id} style={{
              borderBottom: '1px solid var(--border-color)',
              transition: 'var(--transition-fast)'
            }}>
              <td style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                #{inv.id}
              </td>
              <td style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} color="var(--primary-500)" />
                  {inv.filename}
                  {inv.similarity_score && (
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: 'var(--accent-cyan)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}>
                      <Sparkles size={10} /> {Math.round(inv.similarity_score * 100)}% Match
                    </span>
                  )}
                </div>
              </td>
              <td style={{ padding: '0.85rem 1rem' }}>
                {inv.vendor_name || <span style={{ color: 'var(--text-dim)' }}>Unextracted</span>}
              </td>
              <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)' }}>
                {inv.invoice_number || <span style={{ color: 'var(--text-dim)' }}>N/A</span>}
              </td>
              <td style={{ padding: '0.85rem 1rem' }}>
                {inv.invoice_date || <span style={{ color: 'var(--text-dim)' }}>N/A</span>}
              </td>
              <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                {inv.total_amount ? `${inv.currency || 'INR'} ${inv.total_amount.toLocaleString()}` : <span style={{ color: 'var(--text-dim)' }}>0.00</span>}
              </td>
              <td style={{ padding: '0.85rem 1rem' }}>
                <StatusBadge status={inv.status} />
              </td>
              <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    onClick={() => onViewInvoice && onViewInvoice(inv)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <Eye size={14} /> View
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete invoice #${inv.id} (${inv.filename})? This will permanently purge it from PostgreSQL, Qdrant Vector DB, and Blob Storage.`)) {
                        onDeleteInvoice && onDeleteInvoice(inv.id);
                      }
                    }}
                    title="Delete Invoice"
                    style={{
                      padding: '0.35rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(244, 63, 94, 0.12)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      color: 'var(--accent-rose)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
