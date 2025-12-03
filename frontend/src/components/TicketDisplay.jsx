export default function TicketDisplay({ ticket, onClose }) {
  if (!ticket) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Ticket Details</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ✕
        </button>
      </div>

      <div 
        className="border-l-4 p-6 rounded-lg mb-4"
        style={{ 
          borderColor: ticket.ageColor,
          backgroundColor: `${ticket.ageColor}10`
        }}
      >
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {ticket.ticketNumber}
          </div>
          {ticket.isScanned && (
            <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
              ✓ Already Scanned
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600">Full Name</p>
            <p className="text-lg font-semibold">{ticket.name} {ticket.surname}</p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600">Age</p>
            <p 
              className="text-lg font-semibold"
              style={{ color: ticket.ageColor }}
            >
              {ticket.age} years old
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-semibold break-all">{ticket.email}</p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600">Class</p>
            <p className="text-lg font-semibold">{ticket.class}</p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600">Date of Birth</p>
            <p className="text-lg font-semibold">{ticket.birthdate}</p>
          </div>

          {ticket.isScanned && ticket.scannedAt && (
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">Scanned At</p>
              <p className="text-lg font-semibold">
                {new Date(ticket.scannedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {ticket.isScanned && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold">
            ⚠️ This ticket has already been scanned!
          </p>
          {ticket.scannedBy && (
            <p className="text-sm text-yellow-700 mt-1">
              Scanned by: {ticket.scannedBy}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
