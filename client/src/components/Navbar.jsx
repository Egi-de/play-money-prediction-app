import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, User } from 'lucide-react';
import api from '../api/client';
import LoginModal from './LoginModal';

export default function Navbar() {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (name) => {
    try {
      const res = await api.post('/users', { username: name });
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('userId', res.data._id);
      setUsername(res.data.username);
      setShowLoginModal(false);
      window.location.reload();
    } catch (err) {
      alert("Login failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setUsername('');
    navigate('/');
  };

  return (
    <nav className="bg-[#1a1f2e] border-b border-[#2d3748] sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <TrendingUp className="h-7 w-7 text-blue-500 group-hover:text-blue-400 transition" />
              <span className="text-xl font-bold tracking-tight text-white">PolyClone</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link 
              to="/leaderboard" 
              className="flex items-center space-x-1 text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
            >
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </Link>
            
            {username ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to={`/profile/${username}`} 
                  className="flex items-center space-x-2 text-gray-300 hover:text-white bg-[#252b3b] px-4 py-2 rounded-lg transition"
                >
                  <User className="h-4 w-4" />
                  <span className="font-semibold">{username}</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="text-sm text-gray-400 hover:text-red-400 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition transform hover:scale-105"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </nav>
  );
}
