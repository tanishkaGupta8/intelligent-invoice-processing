import React from 'react';
import { CheckCircle2, Clock, Loader2, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const normalized = (status || 'PENDING').toUpperCase();

  let config = {
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    color: 'var(--accent-amber)',
    icon: <Clock size={14} />,
    label: 'Pending'
  };

  if (normalized === 'COMPLETED') {
    config = {
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.3)',
      color: 'var(--accent-emerald)',
      icon: <CheckCircle2 size={14} />,
      label: 'Completed'
    };
  } else if (normalized === 'PROCESSING') {
    config = {
      bg: 'rgba(6, 182, 212, 0.12)',
      border: 'rgba(6, 182, 212, 0.3)',
      color: 'var(--accent-cyan)',
      icon: <Loader2 size={14} className="animate-spin" />,
      label: 'Processing'
    };
  } else if (normalized === 'FAILED') {
    config = {
      bg: 'rgba(244, 63, 94, 0.12)',
      border: 'rgba(244, 63, 94, 0.3)',
      color: 'var(--accent-rose)',
      icon: <AlertCircle size={14} />,
      label: 'Failed'
    };
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.25rem 0.75rem',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.78rem',
      fontWeight: 500,
      backgroundColor: config.bg,
      border: `1px solid ${config.border}`,
      color: config.color,
      whiteSpace: 'nowrap'
    }}>
      {config.icon}
      {config.label}
    </span>
  );
}
