const pool = require('../config/database');

class Ticket {
  static async create(ticketData, createdBy) {
    const { email, name, surname, birthdate, ticketClass } = ticketData;
    
    // Generate ticket number
    const year = new Date().getFullYear();
    const countResult = await pool.query('SELECT COUNT(*) FROM tickets');
    const count = parseInt(countResult.rows[0].count) + 1;
    const ticketNumber = `TKT-${year}-${String(count).padStart(5, '0')}`;

    const result = await pool.query(
      `INSERT INTO tickets (ticket_number, email, name, surname, birthdate, class, owner_email, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [ticketNumber, email, name, surname, birthdate, ticketClass, email, createdBy]
    );
    return result.rows[0];
  }

  static async findByTicketNumber(ticketNumber) {
    const result = await pool.query(
      `SELECT t.*, u.username as created_by_username, s.username as scanned_by_username
       FROM tickets t
       LEFT JOIN users u ON t.created_by = u.id
       LEFT JOIN users s ON t.scanned_by = s.id
       WHERE t.ticket_number = $1`,
      [ticketNumber]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT t.*, u.username as created_by_username, s.username as scanned_by_username
       FROM tickets t
       LEFT JOIN users u ON t.created_by = u.id
       LEFT JOIN users s ON t.scanned_by = s.id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT t.*, u.username as created_by_username, s.username as scanned_by_username
      FROM tickets t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN users s ON t.scanned_by = s.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.isScanned !== undefined) {
      query += ` AND t.is_scanned = $${paramCount}`;
      params.push(filters.isScanned);
      paramCount++;
    }

    if (filters.class) {
      query += ` AND t.class = $${paramCount}`;
      params.push(filters.class);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (t.name ILIKE $${paramCount} OR t.surname ILIKE $${paramCount} OR t.email ILIKE $${paramCount} OR t.ticket_number ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async markAsScanned(ticketNumber, scannedBy) {
    const result = await pool.query(
      `UPDATE tickets 
       SET is_scanned = true, scanned_at = CURRENT_TIMESTAMP, scanned_by = $1 
       WHERE ticket_number = $2 AND is_scanned = false 
       RETURNING *`,
      [scannedBy, ticketNumber]
    );
    return result.rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const params = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      fields.push(`${key} = $${paramCount}`);
      params.push(updates[key]);
      paramCount++;
    });

    params.push(id);
    const query = `UPDATE tickets SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await pool.query(query, params);
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM tickets WHERE id = $1', [id]);
  }

  static async getStatistics() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_scanned = true) as scanned,
        COUNT(*) FILTER (WHERE is_scanned = false) as pending,
        COUNT(DISTINCT class) as total_classes
      FROM tickets
    `);
    return result.rows[0];
  }
}

module.exports = Ticket;