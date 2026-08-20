import React from 'react';
import { Search, Sparkles } from 'lucide-react';

export default function SearchBar({ searchQuery, setSearchQuery, onSearch }) {
  const quickPrompts = [
    "Shipping & Logistics",
    "Amount > $5000",
    "Pending Approval",
    "Office Supplies"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <form onSubmit={handleSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem' }} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Try natural language search e.g. "Shipping invoices total over $5000"...'
          style={{
            width: '100%',
            padding: '0.85rem 1rem 0.85rem 2.8rem',
            backgroundColor: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-main)',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'var(--transition-fast)'
          }}
        />
        <button 
          type="submit"
          style={{
            position: 'absolute',
            right: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          <Sparkles size={14} /> Search
        </button>
      </form>

      {/* Quick Search Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Quick Filters:</span>
        {quickPrompts.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setSearchQuery(chip);
              if (onSearch) onSearch(chip);
            }}
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
