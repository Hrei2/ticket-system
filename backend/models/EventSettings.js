const pool = require('../config/database');

class EventSettings {
  static async get() {
    const result = await pool.query(
      'SELECT * FROM event_settings ORDER BY id DESC LIMIT 1'
    );
    return result.rows[0];
  }

  static async update(eventDate, allowedClasses, ageColorRanges) {
    const result = await pool.query(
      `UPDATE event_settings 
       SET event_date = $1, allowed_classes = $2, age_color_ranges = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = (SELECT id FROM event_settings ORDER BY id DESC LIMIT 1)
       RETURNING *`,
      [eventDate, JSON.stringify(allowedClasses), JSON.stringify(ageColorRanges)]
    );
    return result.rows[0];
  }

  static async create(eventDate, allowedClasses, ageColorRanges) {
    const result = await pool.query(
      'INSERT INTO event_settings (event_date, allowed_classes, age_color_ranges) VALUES ($1, $2, $3) RETURNING *',
      [eventDate, JSON.stringify(allowedClasses), JSON.stringify(ageColorRanges)]
    );
    return result.rows[0];
  }
}

module.exports = EventSettings;