import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Trophy, Medal, Award } from 'lucide-react';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard')
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-400" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-300" />;
    if (index === 2) return <Award className="h-6 w-6 text-orange-400" />;
    return null;
  };

  const getRankBadge = (index) => {
    const badges = {
      0: 'bg-yellow-600/20 border-yellow-500/50 text-yellow-400',
      1: 'bg-gray-600/20 border-gray-400/50 text-gray-300',
      2: 'bg-orange-600/20 border-orange-500/50 text-orange-400'
    };
    return badges[index] || 'bg-[#252b3b] border-[#2d3748] text-gray-400';
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-[#1e2433] border border-[#2d3748] rounded-xl p-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-[#2d3748] last:border-b-0">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 skeleton rounded-full"></div>
                <div className="h-5 w-32 skeleton rounded"></div>
              </div>
              <div className="h-6 w-20 skeleton rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="flex items-center">
          <Trophy className="h-8 w-8 text-yellow-400 mr-3" />
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Leaderboard</h1>
        </div>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Top traders by points</p>
      </div>
      
      {/* Leaderboard Table */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No users yet. Be the first to join!
          </div>
        ) : (
          <table className="min-w-full divide-y divide-transparent">
            <tbody>
              {users.map((user, index) => (
                <tr 
                  key={user._id} 
                  className="border-b last:border-b-0 transition"
                  style={{ borderColor: 'var(--border-primary)', backgroundColor: index < 3 ? 'var(--bg-card-highlight)' : 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index < 3 ? 'var(--bg-card-highlight)' : 'transparent'}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className={`w-12 h-12 flex items-center justify-center rounded-full border ${getRankBadge(index)}`}>
                        {getRankIcon(index) || (
                          <span className="font-bold text-lg">{index + 1}</span>
                        )}
                      </div>
                      
                      {/* Username */}
                      <div>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user.username}</span>
                        {index === 0 && (
                          <span className="ml-2 text-xs px-2 py-1 rounded font-medium" style={{
                            backgroundColor: '#fbbf24',
                            color: '#78350f'
                          }}>
                            Top Trader
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  {/* Points */}
                  <td className="px-6 py-5 text-right">
                    <div className="font-mono font-bold text-xl" style={{ color: 'var(--text-accent)' }}>
                      {user.points.toLocaleString()}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>points</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Showing top {users.length} traders
      </div>
    </div>
  );
}
