import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/client';
import LoginModal from '../components/LoginModal';

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
      <div className="bg-[#1e2433] border border-[#2d3748] rounded-xl p-8 mb-6">
        <h1 className="text-3xl font-bold text-white mb-3">{market.question}</h1>
        <p className="text-gray-400 mb-6">{market.description}</p>
        
        {/* Odds Display - Polymarket Style */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Yes */}
          <div className={`${isResolved && market.resolvedOutcome === 'Yes' ? 'bg-green-600/20 border-green-500 border-2' : 'bg-green-600/10 border-green-600/30'} border rounded-xl p-6 transition`}>
            <div className="text-sm text-green-400 font-medium mb-2">Yes</div>
            <div className="text-5xl font-bold text-green-400 mb-2">{yesOdds}%</div>
            {isResolved && market.resolvedOutcome === 'Yes' && (
              <div className="flex items-center text-green-400 text-sm">
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
        <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-[#2d3748]">
          <span>{totalVolume} points volume</span>
          <span>
            {isResolved ? (
              <span className="text-blue-400 font-medium">Resolved</span>
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
        <div className="bg-[#1e2433] border border-[#2d3748] rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Place Prediction</h3>
          
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
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-6 text-center">
              <h4 className="text-lg font-bold text-white mb-2">Market Resolved</h4>
              <p className="text-gray-400">
                Winning Outcome: <span className="font-bold text-blue-400">{market.resolvedOutcome}</span>
              </p>
            </div>
          ) : isClosed ? (
            <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-6 text-center">
              <h4 className="text-lg font-bold text-white mb-2">Market Closed</h4>
              <p className="text-gray-400">This market is no longer accepting predictions</p>
            </div>
          ) : user ? (
            <form onSubmit={handlePredict}>
              {/* Outcome Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Outcome</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    onClick={() => setOutcome('Yes')} 
                    className={`py-3 rounded-lg font-bold transition transform active:scale-95 ${
                      outcome === 'Yes' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-[#252b3b] text-gray-400 hover:bg-[#2d3748]'
                    }`}
                  >
                    Yes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setOutcome('No')} 
                    className={`py-3 rounded-lg font-bold transition transform active:scale-95 ${
                      outcome === 'No' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-[#252b3b] text-gray-400 hover:bg-[#2d3748]'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (Points)
                </label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full p-3 bg-[#252b3b] border border-[#2d3748] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder={`Balance: ${user.points} pts`}
                  min="1"
                  max={user.points}
                />
                <p className="text-xs text-gray-500 mt-1">Available: {user.points} points</p>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={!amount || amount <= 0}
              >
                Predict {outcome}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">Please sign in to place predictions</p>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Rules Panel */}
        <div className="bg-[#1e2433] border border-[#2d3748] rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Predictions use a <strong className="text-white">parimutuel system</strong> - all bets pool together</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Odds update dynamically based on the pool ratio</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Winners share the <strong className="text-white">total pool</strong> proportional to their bet</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>If you bet 100 on Yes and Yes wins, your payout depends on the final pool split</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>This is <strong className="text-white">play money</strong> - no real currency involved</span>
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
