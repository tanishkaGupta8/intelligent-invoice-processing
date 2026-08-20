import React, { useState, useEffect } from 'react';
import { FileText, Cpu, Server, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function Navbar() {
  const [systemStatus, setSystemStatus] = useState({ online: true, text: 'System Operational' });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await axios.get('http://localhost:8000/health', { timeout: 3000 });
        if (res.status === 200) {
          setSystemStatus({ online: true, text: 'System Operational' });
        }
      } catch (err) {
        setSystemStatus({ online: false, text: 'Backend Standby (Demo Preset Mode)' });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, var(--primary-500), var(--accent-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <FileText size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', lineHeight: '1.2' }} className="gradient-text">
              InvoiceAI System
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Intelligent Invoice Processing & Semantic Search
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: systemStatus.online ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${systemStatus.online ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            color: systemStatus.online ? 'var(--accent-emerald)' : 'var(--accent-amber)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: systemStatus.online ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              display: 'inline-block'
            }} className="animate-pulse-glow"></span>
            {systemStatus.text}
          </div>
        </div>
      </div>
    </header>
  );
}
