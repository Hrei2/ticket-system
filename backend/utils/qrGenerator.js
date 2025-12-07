const QRCode = require('qrcode');
const crypto = require('crypto');

// Encryption configuration
const ENCRYPTION_KEY = process.env.QR_ENCRYPTION_KEY || 'rv3g-on-top-secret-key-32chars'; // Must be 32 characters
const ALGORITHM = 'aes-256-cbc';

function encryptTicketNumber(ticketNumber) {
  // Ensure key is exactly 32 bytes
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(ticketNumber, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return iv + encrypted data (iv is needed for decryption)
  return iv.toString('hex') + ':' + encrypted;
}

function decryptTicketNumber(encryptedData) {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

async function generateQRCode(ticketNumber) {
  try {
    // Encrypt the ticket number
    const encryptedTicket = encryptTicketNumber(ticketNumber);
    
    // Generate QR code as data URL (base64) with encrypted data
    const qrCodeDataURL = await QRCode.toDataURL(encryptedTicket, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

async function generateQRCodeBuffer(ticketNumber) {
  try {
    // Encrypt the ticket number
    const encryptedTicket = encryptTicketNumber(ticketNumber);
    
    // Generate QR code as buffer (for email attachment)
    const qrCodeBuffer = await QRCode.toBuffer(encryptedTicket, {
      width: 300,
      margin: 2
    });
    return qrCodeBuffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw error;
  }
}

module.exports = {
  generateQRCode,
  generateQRCodeBuffer,
  encryptTicketNumber,
  decryptTicketNumber
};
