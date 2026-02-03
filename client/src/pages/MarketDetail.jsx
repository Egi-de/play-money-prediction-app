import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/client';
import LoginModal from '../components/LoginModal';
import { useAdmin } from '../context/AdminContext';

const getCategoryColor = (category) => {
  const colors = {
    'Crypto': 'var(--category-crypto)',
    'Weather': 'var(--category-weather)',
    'Tech': 'var(--category-tech)',
    'Sports': 'var(--category-sports)',
    'Economics': 'var(--category-economics)',
    'Science': 'var(--category-science)',
    'Politics': 'var(--category-politics)',
    'All': 'var(--category-all)'
  };
  return colors[category] || 'var(--category-all)';
};

export default function MarketDetail() {
  const { id } = useParams();
  const [market, setMarket] = useState(null);
  const [amount, setAmount] = useState('');
  const [outcome, setOutcome] = useState('Yes');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAdmin } = useAdmin();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [marketRes, userRes] = await Promise.all([
        api.get(`/markets/${id}`),
        localStorage.getItem('username') 
          ? api.get(`/users/${localStorage.getItem('username')}`) 
          : Promise.resolve({ data: { user: null } })
      ]);
      
      setMarket(marketRes.data);
      if (userRes.data.user) setUser(userRes.data.user);
    } catch (err) {
      console.error(err);
      setError('Failed to load market');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginFromModal = async (name) => {
    try {
      const res = await api.post('/users', { username: name });
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('userId', res.data._id);
      setShowLoginModal(false);
      window.location.reload();
    } catch (err) {
      setError("Login failed");
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!user) {
      setError('Please sign in to place a prediction');
      return;
    }
    
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    try {
      await api.post('/orders', {
        userId: user._id,
        marketId: market._id,
        outcome,
        amount: Number(amount)
      });
      setSuccess(`Successfully predicted ${amount} points on ${outcome}!`);
      setAmount('');
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Error placing prediction');
    }
  };

  const getOdds = (pool, outcome) => {
    const total = Object.values(pool).reduce((a, b) => a + b, 0);
    if (total === 0) return 50;
    return Math.round(((pool[outcome] || 0) / total) * 100);
  };

  const getTotalVolume = (pool) => {
    return Object.values(pool).reduce((a, b) => a + b, 0);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#1e2433] border border-[#2d3748] rounded-xl p-8">
          <div className="h-8 skeleton rounded w-3/4 mb-4"></div>
          <div className="h-4 skeleton rounded w-full mb-2"></div>
          <div className="h-4 skeleton rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 skeleton rounded-lg"></div>
            <div className="h-24 skeleton rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#1e2433] border border-[#2d3748] rounded-xl p-8 text-center">
          <p className="text-gray-400">Market not found</p>
        </div>
      </div>
    );
  }

  const yesOdds = getOdds(market.outcomePools, 'Yes');
  const noOdds = 100 - yesOdds;
  const totalVolume = getTotalVolume(market.outcomePools);
  const isResolved = market.status === 'RESOLVED';
  const isClosed = new Date() > new Date(market.closesAt);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Market Header */}
      <div className="rounded-xl p-8 mb-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
        
        <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{market.question}</h1>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{market.description}</p>
        
        {/* Odds Display - Polymarket Style */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Yes */}
          <div className={`${isResolved && market.resolvedOutcome === 'Yes' ? 'border-2' : 'border'} rounded-xl p-6 transition`}
            style={{
              backgroundColor: isResolved && market.resolvedOutcome === 'Yes' 
                ? 'rgba(20, 184, 166, 0.2)' 
                : 'rgba(20, 184, 166, 0.1)',
              borderColor: isResolved && market.resolvedOutcome === 'Yes'
                ? 'var(--accent-primary)'
                : 'rgba(20, 184, 166, 0.3)'
            }}
          >
            <div className="text-sm font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>Yes</div>
            <div className="text-5xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>{yesOdds}%</div>
            {isResolved && market.resolvedOutcome === 'Yes' && (
              <div className="flex items-center text-sm" style={{ color: 'var(--accent-primary)' }}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span>Winner</span>
              </div>
            )}
          </div>

          {/* No */}
          <div className={`${isResolved && market.resolvedOutcome === 'No' ? 'bg-red-600/20 border-red-500 border-2' : 'bg-red-600/10 border-red-600/30'} border rounded-xl p-6 transition`}>
            <div className="text-sm text-red-400 font-medium mb-2">No</div>
            <div className="text-5xl font-bold text-red-400 mb-2">{noOdds}%</div>
            {isResolved && market.resolvedOutcome === 'No' && (
              <div className="flex items-center text-red-400 text-sm">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span>Winner</span>
              </div>
            )}
          </div>
        </div>

        {/* Market Info */}
        <div className="flex items-center justify-between text-sm pt-4 border-t" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-primary)' }}>
          <span>{totalVolume} points volume</span>
          <span>
            {isResolved ? (
              <span className="font-medium" style={{ color: 'var(--accent-primary)' }}>Resolved</span>
            ) : isClosed ? (
              <span className="text-yellow-400 font-medium">Closed</span>
            ) : (
              `Closes ${new Date(market.closesAt).toLocaleDateString()}`
            )}
          </span>
        </div>
      </div>

      {/* Action Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prediction Form */}
        <div className="rounded-xl p-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Place Prediction</h3>
          
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-600/10 border border-red-600/30 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-600/10 border border-green-600/30 rounded-lg flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-green-400 text-sm">{success}</span>
            </div>
          )}


          {isResolved ? (
            <div className="rounded-lg p-6 text-center" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.3)' }}>
              <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Market Resolved</h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                Winning Outcome: <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>{market.resolvedOutcome}</span>
              </p>
            </div>
          ) : isClosed ? (
            <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-6 text-center">
              <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Market Closed</h4>
              <p style={{ color: 'var(--text-secondary)' }}>This market is no longer accepting predictions</p>
            </div>
          ) : isAdmin ? (
            <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-6 text-center">
              <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Admin Account</h4>
              <p style={{ color: 'var(--text-secondary)' }}>Admin users cannot place bets to avoid conflicts of interest</p>
            </div>
          ) : user ? (
            <form onSubmit={handlePredict}>
              {/* Outcome Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Select Outcome</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    onClick={() => setOutcome('Yes')} 
                    className={`py-3 rounded-lg font-bold transition transform active:scale-95 ${
                      outcome === 'Yes' 
                        ? 'text-white' 
                        : ''
                    }`}
                    style={outcome === 'Yes' ? { 
                      backgroundColor: 'var(--accent-primary)' 
                    } : { 
                      backgroundColor: 'var(--bg-card-hover)', 
                      color: 'var(--text-secondary)' 
                    }}
                  >
                    Yes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setOutcome('No')} 
                    className={`py-3 rounded-lg font-bold transition transform active:scale-95 ${
                      outcome === 'No' 
                        ? 'bg-red-600 text-white' 
                        : ''
                    }`}
                    style={outcome !== 'No' ? { backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-secondary)' } : {}}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Amount (Points)
                </label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  style={{ backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                  placeholder={`Balance: ${user.points} pts`}
                  min="1"
                  max={user.points}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Available: {user.points} points</p>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full py-3 text-white font-bold rounded-lg transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
                style={{ backgroundColor: 'var(--accent-primary)' }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)')}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
                disabled={!amount || amount <= 0}
              >
                Predict {outcome}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Please sign in to place predictions</p>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-2 text-white font-semibold rounded-lg transition"
                style={{ backgroundColor: 'var(--accent-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Rules Panel */}
        <div className="rounded-xl p-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>How It Works</h3>
          <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li className="flex items-start">
              <span className="mr-2" style={{ color: 'var(--accent-primary)' }}>•</span>
              <span>Predictions use a <strong style={{ color: 'var(--text-primary)' }}>parimutuel system</strong> - all bets pool together</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2" style={{ color: 'var(--accent-primary)' }}>•</span>
              <span>Odds update dynamically based on the pool ratio</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2" style={{ color: 'var(--accent-primary)' }}>•</span>
              <span>Winners share the <strong style={{ color: 'var(--text-primary)' }}>total pool</strong> proportional to their bet</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2" style={{ color: 'var(--accent-primary)' }}>•</span>
              <span>If you bet 100 on Yes and Yes wins, your payout depends on the final pool split</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2" style={{ color: 'var(--accent-primary)' }}>•</span>
              <span>This is <strong style={{ color: 'var(--text-primary)' }}>play money</strong> - no real currency involved</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginFromModal}
      />
    </div>
  );
}
