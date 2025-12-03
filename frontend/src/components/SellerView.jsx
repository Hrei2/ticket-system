import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TicketForm from './TicketForm';

export default function SellerView() {
  const { user, logout } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');
  const [lastTicket, setLastTicket] = useState(null);

  const handleTicketCreated = (ticket) => {
    setLastTicket(ticket);
    setSuccessMessage(`Ticket ${ticket.ticket_number} created successfully! Email sent to ${ticket.email}`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🎟️ Ticket Sales</h1>
            <p className="text-sm text-gray-600">Welcome, {user.username}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center justify-between">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="text-green-700 hover:text-green-900">
              ✕
            </button>
          </div>
        )}

        <TicketForm onSuccess={handleTicketCreated} />

        {lastTicket && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-900">Last Ticket Created</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium">Ticket Number:</span>
                <p className="text-lg font-bold text-blue-600">{lastTicket.ticket_number}</p>
              </div>
              <div>
                <span className="font-medium">Name:</span>
                <p>{lastTicket.name} {lastTicket.surname}</p>
              </div>
              <div>
                <span className="font-medium">Email:</span>
                <p>{lastTicket.email}</p>
              </div>
              <div>
                <span className="font-medium">Class:</span>
                <p>{lastTicket.class}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
