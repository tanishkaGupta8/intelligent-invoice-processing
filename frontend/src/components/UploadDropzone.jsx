import React, { useState, useRef } from 'react';
import { UploadCloud, File, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function UploadDropzone({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setMessage({ type: 'error', text: 'Only PDF invoices (.pdf) are supported.' });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size exceeds maximum limit of 25 MB.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/invoices/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: `Uploaded ${file.name} successfully!` });
      if (onUploadSuccess) onUploadSuccess(response.data);
    } catch (err) {
      console.error("Upload error:", err);
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || err.message || 'Upload failed. Check backend server connection.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--primary-500)' : 'var(--border-color)'}`,
          backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-glass)',
          borderRadius: 'var(--radius-md)',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'var(--transition-smooth)'
        }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          accept=".pdf" 
          style={{ display: 'none' }} 
        />

        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <Loader2 size={40} color="var(--primary-500)" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ fontWeight: 600 }}>Streaming PDF to Backend...</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Creating invoice record</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-500)'
            }}>
              <UploadCloud size={28} />
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
                Drag & Drop PDF Invoice Here
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                or <span style={{ color: 'var(--primary-500)', textDecoration: 'underline' }}>browse files</span> from your computer
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Supports Digital PDFs & Scanned Documents (.pdf)
            </span>
          </div>
        )}
      </div>

      {message && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
          color: message.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}
    </div>
  );
}
