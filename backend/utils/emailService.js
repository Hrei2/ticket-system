const { Resend } = require('resend');
const { generateTicketEmailHTML } = require('../templates/ticketEmail');
const { generateQRCode } = require('./qrGenerator');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTicketEmail(ticketData) {
  try {
    // Generate QR code
    const qrCodeDataURL = await generateQRCode(ticketData.ticket_number);
    
    // Generate email HTML
    const emailHTML = generateTicketEmailHTML(ticketData, qrCodeDataURL);
    
    // Send email
    const data = await resend.emails.send({
      from: 'Ticket System <onboarding@resend.dev>', // Change this to your verified domain
      to: [ticketData.email],
      subject: `Your Ticket: ${ticketData.ticket_number}`,
      html: emailHTML
    });
    
    console.log('✅ Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

async function sendTicketUpdateEmail(ticketData, changes) {
  try {
    const changesList = Object.entries(changes)
      .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
      .join('');
    
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 3px solid #2196F3; padding-bottom: 20px; margin-bottom: 30px; }
          h1 { color: #2196F3; }
          ul { background-color: #f9f9f9; padding: 20px; border-left: 4px solid #2196F3; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔄 Ticket Updated</h1>
          </div>
          <p>Hello ${ticketData.name} ${ticketData.surname},</p>
          <p>Your ticket <strong>${ticketData.ticket_number}</strong> has been updated with the following changes:</p>
          <ul>${changesList}</ul>
          <p>If you have any questions about these changes, please contact the event organizers.</p>
        </div>
      </body>
      </html>
    `;
    
    const data = await resend.emails.send({
      from: 'Ticket System <onboarding@resend.dev>',
      to: [ticketData.owner_email],
      subject: `Ticket Updated: ${ticketData.ticket_number}`,
      html: emailHTML
    });
    
    console.log('✅ Update email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error sending update email:', error);
    throw error;
  }
}

module.exports = {
  sendTicketEmail,
  sendTicketUpdateEmail
};
