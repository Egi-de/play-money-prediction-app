import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Home() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const res = await api.get('/markets');
      setMarkets(res.data);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Markets</h1>
        <p className="text-gray-400 mt-1">Trade on your predictions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {markets.map(market => {
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
              <div className="bg-[#1e2433] border border-[#2d3748] hover:border-[#4a5568] rounded-xl p-6 transition-all duration-200 hover:transform hover:-translate-y-1 h-full flex flex-col">
                {/* Top Content Group */}
                <div className="mb-auto">
                  {/* Market Question */}
                  <h2 className="text-lg font-semibold text-white group-hover:text-blue-400 transition line-clamp-2 mb-3 h-[3.5rem]">
                    {market.question}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-gray-400 line-clamp-2 mb-6 h-[2.5rem]">
                    {market.description}
                  </p>
                </div>

                {/* Outcome Buttons - Polymarket Style */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Yes Button */}
                  <div className={`${isResolved && market.resolvedOutcome === 'Yes' ? 'bg-green-600/20 border-green-500' : 'bg-green-600/10 border-green-600/30'} border rounded-lg p-3 transition`}>
                    <div className="text-xs text-green-400 font-medium mb-1">Yes</div>
                    <div className="text-2xl font-bold text-green-400">{yesOdds}%</div>
                  </div>

                  {/* No Button */}
                  <div className={`${isResolved && market.resolvedOutcome === 'No' ? 'bg-red-600/20 border-red-500' : 'bg-red-600/10 border-red-600/30'} border rounded-lg p-3 transition`}>
                    <div className="text-xs text-red-400 font-medium mb-1">No</div>
                    <div className="text-2xl font-bold text-red-400">{noOdds}%</div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{totalVolume} pts volume</span>
                  <span>
                    {isResolved ? (
                      <span className="text-blue-400 font-medium">Resolved</span>
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

      {markets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No markets available</p>
        </div>
      )}
    </div>
  );
}
