import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, LayoutDashboard, Trophy, User, LogOut } from 'lucide-react';
import { useAdmin } from '../context/AdminContext'; // Import context
import api from '../api/client';
import LoginModal from './LoginModal';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [userPoints, setUserPoints] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { isAdmin, resetAdminStatus } = useAdmin(); // Get admin status and reset function
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (username) {
      fetchUserPoints();
    }
  }, [username]);

  const fetchUserPoints = async () => {
    try {
      const res = await api.get(`/users/${username}`);
      setUserPoints(res.data.user.points);
    } catch (err) {
      console.error('Failed to fetch user points:', err);
    }
  };

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
    setUserPoints(null);
    resetAdminStatus(); // Reset admin state
    navigate('/');
  };

  const formatPoints = (points) => {
    if (points === null) return '';
    return points.toLocaleString();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <TrendingUp className="h-6 w-6 transition" style={{ color: 'var(--accent-primary)' }} />
              <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>PredictX</span>
            </Link>
          </div>

          {/* Center: Navigation Tabs */}
          <div className="flex items-center space-x-1">
            <Link 
              to="/" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/') ? 'text-[var(--accent-primary)]' : ''
              }`}
              style={{ 
                color: isActive('/') ? 'var(--accent-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive('/') ? 'rgba(20, 184, 166, 0.1)' : 'transparent'
              }}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Markets</span>
            </Link>
            
            {username && (
              <Link 
                to={isAdmin ? "/admin" : `/profile/${username}`}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  (isAdmin ? isActive('/admin') : location.pathname.includes('/profile')) ? 'text-[var(--accent-primary)]' : ''
                }`}
                style={{ 
                  color: (isAdmin ? isActive('/admin') : location.pathname.includes('/profile')) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  backgroundColor: (isAdmin ? isActive('/admin') : location.pathname.includes('/profile')) ? 'rgba(20, 184, 166, 0.1)' : 'transparent'
                }}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            )}
            
            <Link 
              to="/leaderboard" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/leaderboard') ? 'text-[var(--accent-primary)]' : ''
              }`}
              style={{ 
                color: isActive('/leaderboard') ? 'var(--accent-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive('/leaderboard') ? 'rgba(20, 184, 166, 0.1)' : 'transparent'
              }}
            >
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </Link>
          </div>
          
          {/* Right: Points, Theme Toggle, User */}
          <div className="flex items-center space-x-4">
            {username && userPoints !== null && !isAdmin && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {formatPoints(userPoints)} <span style={{ color: 'var(--text-secondary)' }}>pts</span>
                </span>
              </div>
            )}
            
            <ThemeToggle />
            
            {username ? (
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg transition hover:bg-[var(--bg-card-hover)]"
                >
                  <User className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg border py-1 z-50 animate-in fade-in zoom-in-95 duration-200"
                    style={{ 
                      backgroundColor: 'var(--bg-card)', 
                      borderColor: 'var(--border-primary)' 
                    }}
                  >
                    <Link 
                      to={`/profile/${username}`}
                      className="flex items-center px-4 py-2 text-sm transition hover:bg-[var(--bg-card-hover)]"
                      style={{ color: 'var(--text-primary)' }}
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm transition hover:bg-[var(--bg-card-hover)]"
                      style={{ color: 'var(--category-economics)' }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)} 
                className="text-white px-5 py-2 rounded-lg text-sm font-semibold transition transform hover:scale-105"
                style={{ 
                  backgroundColor: 'var(--accent-primary)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
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
