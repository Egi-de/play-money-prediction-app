import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import api from '../api/client';

const CATEGORIES = ['All', 'Crypto', 'Weather', 'Tech', 'Sports', 'Economics', 'Science', 'Politics'];

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

export default function Home() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'open', 'resolved'
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetchMarkets();
  }, [categoryFilter]);

  const fetchMarkets = async () => {
    try {
      const params = categoryFilter !== 'All' ? { category: categoryFilter } : {};
      const res = await api.get('/markets', { params });
      if (Array.isArray(res.data)) {
        setMarkets(res.data);
      } else {
        console.error('Expected array of markets but got:', res.data);
        setMarkets([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  // Filter markets based on search and status
  const filteredMarkets = (Array.isArray(markets) ? markets : []).filter(market => {
    const matchesSearch = market.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         market.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'open' && market.status === 'OPEN') ||
                         (statusFilter === 'resolved' && market.status === 'RESOLVED');
    return matchesSearch && matchesStatus;
  });

  // Skeleton Loading Component
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-9 w-48 skeleton rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-[#1e2433] border border-[#2d3748] rounded-xl p-6">
              <div className="h-6 skeleton rounded w-3/4 mb-3"></div>
              <div className="h-4 skeleton rounded w-full mb-2"></div>
              <div className="h-4 skeleton rounded w-2/3 mb-6"></div>
              <div className="flex gap-3">
                <div className="flex-1 h-16 skeleton rounded-lg"></div>
                <div className="flex-1 h-16 skeleton rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border transition text-base"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
        
        {/* Filter Buttons Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Status Filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition text-sm flex items-center gap-2 ${
                statusFilter === 'all' 
                  ? 'text-white' 
                  : 'border'
              }`}
              style={statusFilter === 'all' ? {
                backgroundColor: 'var(--accent-primary)'
              } : {
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-secondary)'
              }}
            >
              <TrendingUp className="h-4 w-4" />
              All Markets
            </button>
            <button
              onClick={() => setStatusFilter('open')}
              className={`px-4 py-2 rounded-lg font-medium transition text-sm flex items-center gap-2 ${
                statusFilter === 'open' 
                  ? 'text-white' 
                  : 'border'
              }`}
              style={statusFilter === 'open' ? {
                backgroundColor: 'var(--accent-primary)'
              } : {
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-secondary)'
              }}
            >
              <Clock className="h-4 w-4" />
              Open
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-4 py-2 rounded-lg font-medium transition text-sm flex items-center gap-2 ${
                statusFilter === 'resolved' 
                  ? 'text-white' 
                  : 'border'
              }`}
              style={statusFilter === 'resolved' ? {
                backgroundColor: 'var(--accent-primary)'
              } : {
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-secondary)'
              }}
            >
              <CheckCircle className="h-4 w-4" />
              Resolved
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                  categoryFilter === category ? 'text-white' : ''
                }`}
                style={categoryFilter === category ? {
                  backgroundColor: getCategoryColor(category),
                  color: 'white'
                } : {
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Market Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMarkets.map(market => {
          const yesOdds = getOdds(market.outcomePools, 'Yes');
          const noOdds = 100 - yesOdds;
          const totalVolume = getTotalVolume(market.outcomePools);
          const isResolved = market.status === 'RESOLVED';

          return (
            <Link 
              to={`/market/${market._id}`} 
              key={market._id} 
              className="block group h-full"
            >
              <div className="rounded-xl p-6 transition-all duration-200 hover:transform hover:-translate-y-1 h-full flex flex-col border" style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-primary)'
              }}>
                {/* Top Content Group */}
                <div className="mb-auto">
                  {/* Market Question */}
                  <h2 className="text-lg font-semibold transition line-clamp-2 mb-3 h-[3.5rem]" 
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {market.question}
                  </h2>

                  {/* Description */}
                  <p className="text-sm line-clamp-2 mb-6 h-[2.5rem]" style={{ color: 'var(--text-secondary)' }}>
                    {market.description}
                  </p>
                </div>

                {/* Outcome Buttons - Polymarket Style */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Yes Button */}
                  <div className={`${isResolved && market.resolvedOutcome === 'Yes' ? 'border-2' : 'border'} rounded-lg p-3 transition`}
                    style={{
                      backgroundColor: isResolved && market.resolvedOutcome === 'Yes' 
                        ? 'rgba(20, 184, 166, 0.2)' 
                        : 'rgba(20, 184, 166, 0.1)',
                      borderColor: isResolved && market.resolvedOutcome === 'Yes'
                        ? 'var(--accent-primary)'
                        : 'rgba(20, 184, 166, 0.3)'
                    }}
                  >
                    <div className="text-xs font-medium mb-1" style={{ color: 'var(--accent-primary)' }}>Yes</div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>{yesOdds}%</div>
                  </div>

                  {/* No Button */}
                  <div className={`${isResolved && market.resolvedOutcome === 'No' ? 'border-2 border-red-500' : 'border border-red-600/30'} rounded-lg p-3 transition`}
                    style={{
                      backgroundColor: isResolved && market.resolvedOutcome === 'No' 
                        ? 'rgba(239, 68, 68, 0.2)' 
                        : 'rgba(239, 68, 68, 0.1)'
                    }}
                  >
                    <div className="text-xs text-red-400 font-medium mb-1">No</div>
                    <div className="text-2xl font-bold text-red-400">{noOdds}%</div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{totalVolume.toLocaleString()} pts</span>
                  </div>
                  <span>
                    {isResolved ? (
                      <span style={{ color: 'var(--accent-primary)' }} className="font-medium">Resolved</span>
                    ) : (
                      `Closes ${new Date(market.closesAt).toLocaleDateString()}`
                    )}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredMarkets.length === 0 && !loading && (
        <div className="text-center py-12">
          <p style={{ color: 'var(--text-secondary)' }}>
            {markets.length === 0 
              ? 'No markets available' 
              : 'No markets match your search or filter'}
          </p>
        </div>
      )}
    </div>
  );
}

// Add User icon import
function User({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
