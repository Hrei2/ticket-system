import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { scanTicket, validateTicket } from '../utils/api';
import TicketDisplay from './TicketDisplay';

export default function ScannerView() {
  const { user, logout } = useAuth();
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    if (!ticketNumber.trim()) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await scanTicket(ticketNumber.trim());
      setTicket(response.data.ticket);
      setSuccess('Ticket scanned successfully!');
      setTicketNumber('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to scan ticket';
      setError(errorMsg);
      
      // If already scanned, try to fetch ticket details
      if (errorMsg.includes('already scanned')) {
        try {
          const validationResponse = await validateTicket(ticketNumber.trim());
          setTicket(validationResponse.data.ticket);
        } catch (validateErr) {
          console.error('Failed to fetch ticket details:', validateErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!ticketNumber.trim()) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await validateTicket(ticketNumber.trim());
      setTicket(response.data.ticket);
    } catch (err) {
      setError(err.response?.data?.error || 'Ticket not found');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTicket(null);
    setError('');
    setSuccess('');
    setTicketNumber('');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile-optimized Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">📱 Scanner</h1>
            <p className="text-xs text-gray-600">{user.username}</p>
          </div>
          <button
            onClick={logout}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content - Mobile Optimized */}
      <main className="p-4 pb-20">
        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Ticket Display */}
        {ticket && <TicketDisplay ticket={ticket} onClose={handleClear} />}

        {/* Scan Form - Always visible at bottom */}
        <div className="bg-white rounded-lg shadow-lg p-4 fixed bottom-0 left-0 right-0 border-t-2 border-gray-200">
          <form onSubmit={handleScan} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket Number
              </label>
              <input
                type="text"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="TKT-2025-00001"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="submit"
                disabled={loading || !ticketNumber.trim()}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {loading ? '...' : '✓ Scan'}
              </button>

              <button
                type="button"
                onClick={handleValidate}
                disabled={loading || !ticketNumber.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                Preview
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
