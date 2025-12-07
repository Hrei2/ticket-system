const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function updatePasswords() {
  try {
    const sellerHash = await bcrypt.hash('seller123', 10);
    const scannerHash = await bcrypt.hash('scanner123', 10);
    
    console.log('Seller hash:', sellerHash);
    console.log('Scanner hash:', scannerHash);
    
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2',
      [sellerHash, 'seller']
    );
    
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2',
      [scannerHash, 'scanner']
    );
    
    console.log('Passwords updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updatePasswords();
