const pool = require('./config/database');

async function checkColumns() {
  try {
    const result = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'tickets'"
    );
    console.log('Columns in tickets table:');
    result.rows.forEach(row => console.log('-', row.column_name));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkColumns();
