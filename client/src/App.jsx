import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MarketDetail from './pages/MarketDetail';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

import { AdminProvider } from './context/AdminContext';
import ProtectedRoute from './components/ProtectedRoute';
import Admin from './pages/Admin';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AdminProvider>
      <Router>
        <ToastContainer position="top-right" theme="dark" />
        <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/market/:id" element={<MarketDetail />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile/:username" element={<Profile />} />
              
              {/* Admin Route */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AdminProvider>
  );
}

export default App;
