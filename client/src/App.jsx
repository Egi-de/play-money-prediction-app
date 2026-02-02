import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MarketDetail from './pages/MarketDetail';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0f1419] text-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/market/:id" element={<MarketDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile/:username" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
