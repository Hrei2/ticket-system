function generateTicketEmailHTML(ticketData, qrCodeDataURL) {
  const { ticket_number, name, surname, email, class: ticketClass } = ticketData;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #4CAF50;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #4CAF50;
          margin: 0;
          font-size: 28px;
        }
        .ticket-info {
          background-color: #f9f9f9;
          border-left: 4px solid #4CAF50;
          padding: 20px;
          margin: 20px 0;
        }
        .ticket-info p {
          margin: 10px 0;
          font-size: 16px;
        }
        .ticket-info strong {
          color: #2c3e50;
          display: inline-block;
          width: 150px;
        }
        .qr-code {
          text-align: center;
          margin: 30px 0;
        }
        .qr-code img {
          border: 2px solid #ddd;
          border-radius: 10px;
          padding: 10px;
          background-color: white;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #eee;
          color: #777;
          font-size: 14px;
        }
        .important {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
        }
        .ticket-number {
          font-size: 24px;
          font-weight: bold;
          color: #4CAF50;
          text-align: center;
          margin: 20px 0;
          letter-spacing: 2px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎟️ Your Event Ticket</h1>
          <p>Thank you for your purchase!</p>
        </div>
        
        <div class="ticket-number">
          ${ticket_number}
        </div>
        
        <div class="ticket-info">
          <p><strong>Name:</strong> ${name} ${surname}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Class:</strong> ${ticketClass}</p>
          <p><strong>Ticket Number:</strong> ${ticket_number}</p>
        </div>
        
        <div class="important">
          <strong>⚠️ Important:</strong> Please bring this ticket (either printed or on your phone) to the event. The QR code will be scanned at the entrance.
        </div>
        
        <div class="qr-code">
          <h3>Your QR Code</h3>
          <img src="${qrCodeDataURL}" alt="Ticket QR Code" />
          <p style="color: #777; font-size: 14px;">Show this code at the entrance</p>
        </div>
        
        <div class="footer">
          <p>If you have any questions, please contact event organizers.</p>
          <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = { generateTicketEmailHTML };
