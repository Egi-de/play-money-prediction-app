import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { User, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../api/client';

export default function Profile() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${username}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#1e2433] border border-[#2d3748] rounded-xl p-6 mb-6">
          <div className="h-8 w-48 skeleton rounded mb-2"></div>
          <div className="h-4 w-32 skeleton rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#1e2433] border border-[#2d3748] rounded-xl p-8 text-center">
          <p className="text-gray-400">User not found</p>
        </div>
      </div>
    );
  }

  const totalBet = data.orders.reduce((sum, order) => sum + order.amount, 0);
  const totalPayout = data.orders.reduce((sum, order) => sum + (order.payout || 0), 0);
  const netProfit = totalPayout - totalBet;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="rounded-xl p-8 mb-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{data.user.username}</h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Member since {new Date(data.user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Current Balance</p>
            <p className="text-5xl font-bold" style={{ color: 'var(--accent-primary)' }}>{data.user.points}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>points</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{data.orders.length}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Predictions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalBet}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Wagered</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold flex items-center justify-center ${
              netProfit >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {netProfit >= 0 ? (
                <TrendingUp className="h-5 w-5 mr-1" />
              ) : (
                <TrendingDown className="h-5 w-5 mr-1" />
              )}
              {netProfit >= 0 ? '+' : ''}{netProfit}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Net Profit/Loss</p>
          </div>
        </div>
      </div>

      {/* Activity History */}
      <div>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Activity History</h2>
        <div className="rounded-xl overflow-hidden border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          {data.orders.length === 0 ? (
            <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
              No predictions yet. Start trading to see your history!
            </div>
          ) : (
            data.orders.map(order => {
              const isWin = order.payout > 0;
              const profit = order.payout - order.amount;
              
              return (
                <div 
                  key={order._id} 
                  className="p-5 border-b last:border-b-0 transition"
                  style={{ borderColor: 'var(--border-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        {order.marketId?.question || "Unknown Market"}
                      </p>
                      <div className="flex items-center space-x-3 text-sm">
                        <span className={`font-bold ${
                          order.outcome === 'Yes' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {order.outcome}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">
                          {new Date(order.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="font-mono">
                        <span className="text-red-400">-{order.amount}</span>
                        {isWin && (
                          <span className="text-green-400 ml-2">+{order.payout}</span>
                        )}
                      </div>
                      {isWin && (
                        <div className="text-xs text-green-400 font-medium mt-1">
                          +{profit} profit
                        </div>
                      )}
                      {order.payout === 0 && order.marketId?.status === 'RESOLVED' && (
                        <div className="text-xs text-gray-500 mt-1">
                          Lost
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
