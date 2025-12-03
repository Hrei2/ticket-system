const pool = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/passwordHash');

class User {
  static async create(username, password, role) {
    const hashedPassword = await hashPassword(password);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at',
      [username, hashedPassword, role]
    );
    return result.rows[0];
  }

  static async findByUsername(username) {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, username, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async getAll() {
    const result = await pool.query(
      'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async updateRole(id, role) {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, role',
      [role, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  }

  static async verifyPassword(password, hashedPassword) {
    return await comparePassword(password, hashedPassword);
  }
}

module.exports = User;