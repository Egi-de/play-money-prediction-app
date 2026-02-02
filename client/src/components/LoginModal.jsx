import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
      setUsername('');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fadeIn border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome to PolyClone</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Enter a username to start trading instantly</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              style={{ backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
              autoFocus
            />
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              New users start with 1000 points
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 font-semibold rounded-lg transition"
              style={{ backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!username.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
