import { useEffect, useState } from 'react';
import { getTicketStats } from '../utils/api';

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await getTicketStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8">Failed to load statistics</div>;
  }

  const scanPercentage = stats.total > 0 ? ((stats.scanned / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
        <div className="text-sm text-blue-900 font-medium">Total Tickets</div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="text-3xl font-bold text-green-600 mb-2">{stats.scanned}</div>
        <div className="text-sm text-green-900 font-medium">Scanned</div>
        <div className="text-xs text-green-700 mt-1">{scanPercentage}%</div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.pending}</div>
        <div className="text-sm text-yellow-900 font-medium">Pending</div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="text-3xl font-bold text-purple-600 mb-2">{stats.total_classes}</div>
        <div className="text-sm text-purple-900 font-medium">Classes</div>
      </div>
    </div>
  );
}
