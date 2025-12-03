import { useState, useEffect } from 'react';
import { createTicket } from '../utils/api';

export default function TicketForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    surname: '',
    birthdate: '',
    class: ''
  });
  const [availableClasses] = useState(['10A', '10B', '11A', '11B', '12A', '12B']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await createTicket(formData);
      onSuccess(response.data.ticket);
      
      // Reset form
      setFormData({
        email: '',
        name: '',
        surname: '',
        birthdate: '',
        class: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Ticket</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Birthdate (DDMMYY) *
          </label>
          <input
            type="text"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            placeholder="040609 (June 4, 2009)"
            maxLength="6"
            pattern="\d{6}"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Format: DDMMYY (e.g., 031211 for Dec 3, 2011)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class *
          </label>
          <select
            name="class"
            value={formData.class}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          >
            <option value="">Select a class</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Ticket...' : 'Create Ticket'}
      </button>
    </form>
  );
}
