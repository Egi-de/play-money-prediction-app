import { useState, useEffect } from 'react';
import api from '../api/client';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('markets'); // markets | create | logs
  const [markets, setMarkets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Create Market Form State
  const [formData, setFormData] = useState({
    question: '',
    description: '',
    category: 'Crypto',
    outcomes: 'YES,NO',
    closesAt: ''
  });

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (activeTab === 'markets') fetchMarkets();
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab]);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/markets?category=All');
      setMarkets(res.data);
    } catch (err) {
      alert('Failed to fetch markets');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Pass userId in query for middleware
      const res = await api.get('/admin/logs', { params: { userId } });
      setLogs(res.data);
    } catch (err) {
      alert('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Validate date
    if (new Date(formData.closesAt) <= new Date()) {
      alert('Error: Closing date must be in the future');
      return;
    }

    if (!confirm('Create this market?')) return;

    try {
      const outcomesArray = formData.outcomes.split(',').map(o => o.trim());
      await api.post('/markets', {
        ...formData,
        outcomes: outcomesArray,
        userId // Required for middleware
      });
      alert('Market created successfully!');
      setFormData({ question: '', description: '', category: 'Crypto', outcomes: 'YES,NO', closesAt: '' });
      setActiveTab('markets');
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating market');
    }
  };

  const handleResolve = async (id, outcome) => {
    if (!confirm(`Resolve market as ${outcome}? This cannot be undone.`)) return;

    try {
      await api.post(`/markets/${id}/resolve`, { outcome, userId });
      alert('Market resolved!');
      fetchMarkets();
    } catch (err) {
      alert(err.response?.data?.error || 'Error resolving market');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this market? This cannot be undone.')) return;

    try {
      await api.delete(`/markets/${id}`, { data: { userId } }); // axios delete body syntax
      alert('Market deleted!');
      fetchMarkets();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting market');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-8">
        Admin Dashboard
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-border">
        {['markets', 'create', 'logs'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-4 capitalize ${
              activeTab === tab 
                ? 'border-b-2 border-primary text-primary font-bold' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'markets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Manage Markets</h2>
            <button onClick={fetchMarkets} className="text-primary hover:underline">Refresh</button>
          </div>
          
          {loading ? <p>Loading...</p> : (
            <div className="grid gap-4">
              {markets.map(market => (
                <div key={market._id} className="bg-card p-4 rounded-xl border border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        market.status === 'OPEN' ? 'bg-green-500/20 text-green-400' : 'bg-text-secondary/20 text-text-secondary'
                      }`}>
                        {market.status}
                      </span>
                      <h3 className="text-lg font-bold mt-2">{market.question}</h3>
                      <p className="text-text-secondary text-sm">{market.category} • {new Date(market.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(market._id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  {market.status === 'OPEN' && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <p className="text-sm text-text-secondary mb-2">Resolve as:</p>
                      <div className="flex gap-2 flex-wrap">
                        {market.outcomes.map(outcome => (
                          <button
                            key={outcome}
                            onClick={() => handleResolve(market._id, outcome)}
                            className="bg-surface hover:bg-border px-3 py-1 rounded text-sm transition-colors"
                          >
                            {outcome}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold mb-6">Create New Market</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question</label>
              <input
                required
                type="text"
                className="w-full bg-surface border border-border rounded p-2 focus:border-primary outline-none"
                value={formData.question}
                onChange={e => setFormData({...formData, question: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full bg-surface border border-border rounded p-2 focus:border-primary outline-none h-24"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  className="w-full bg-surface border border-border rounded p-2 focus:border-primary outline-none"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {['Crypto', 'Weather', 'Tech', 'Sports', 'Economics', 'Science', 'Politics'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Closes At</label>
                <input
                  required
                  type="date"
                  className="w-full bg-surface border border-border rounded p-2 focus:border-primary outline-none"
                  value={formData.closesAt}
                  onChange={e => setFormData({...formData, closesAt: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Outcomes (comma separated)</label>
              <input
                type="text"
                className="w-full bg-surface border border-border rounded p-2 focus:border-primary outline-none"
                value={formData.outcomes}
                onChange={e => setFormData({...formData, outcomes: e.target.value})}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-background font-bold py-3 rounded-lg hover:brightness-110 transition-all mt-4"
            >
              Create Market
            </button>
          </form>
        </div>
      )}

      {activeTab === 'logs' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Audit Logs</h2>
          {loading ? <p>Loading...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-text-secondary text-sm">
                    <th className="py-2">Time</th>
                    <th className="py-2">Admin</th>
                    <th className="py-2">Action</th>
                    <th className="py-2">Details</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {logs.map(log => (
                    <tr key={log._id} className="border-b border-border/50">
                      <td className="py-3 text-text-secondary">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 font-medium text-accent">{log.username}</td>
                      <td className="py-3">
                        <span className="bg-surface px-2 py-1 rounded border border-border">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 text-text-secondary max-w-md truncate">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && <p className="text-text-secondary mt-4">No logs found.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
