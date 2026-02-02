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
      <div className="relative bg-[#1e2433] border border-[#2d3748] rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to PolyClone</h2>
          <p className="text-gray-400 text-sm">Enter a username to start trading instantly</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 bg-[#252b3b] border border-[#2d3748] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              New users start with 1000 points
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[#252b3b] hover:bg-[#2d3748] text-gray-300 font-semibold rounded-lg transition"
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
