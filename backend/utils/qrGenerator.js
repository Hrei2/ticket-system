const QRCode = require('qrcode');

async function generateQRCode(ticketNumber) {
  try {
    // Generate QR code as data URL (base64)
    const qrCodeDataURL = await QRCode.toDataURL(ticketNumber, {
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
    // Generate QR code as buffer (for email attachment)
    const qrCodeBuffer = await QRCode.toBuffer(ticketNumber, {
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
  generateQRCodeBuffer
};
