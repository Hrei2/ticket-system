const pool = require('../config/database');

class TicketHistory {
  static async create(ticketId, action, oldValue, newValue, changedBy) {
    const result = await pool.query(
      `INSERT INTO ticket_history (ticket_id, action, old_value, new_value, changed_by) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [ticketId, action, oldValue, newValue, changedBy]
    );
    return result.rows[0];
  }

  static async getByTicketId(ticketId) {
    const result = await pool.query(
      `SELECT th.*, u.username 
       FROM ticket_history th 
       LEFT JOIN users u ON th.changed_by = u.id 
       WHERE th.ticket_id = $1 
       ORDER BY th.changed_at DESC`,
      [ticketId]
    );
    return result.rows;
  }

  static async getAll(limit = 100) {
    const result = await pool.query(
      `SELECT th.*, u.username, t.ticket_number 
       FROM ticket_history th 
       LEFT JOIN users u ON th.changed_by = u.id 
       LEFT JOIN tickets t ON th.ticket_id = t.id 
       ORDER BY th.changed_at DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}

module.exports = TicketHistory;