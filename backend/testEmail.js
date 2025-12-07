const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    console.log('Testing Resend API...');
    console.log('API Key:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');
    
    const testEmail = 'delivered@resend.dev'; // Resend test address
    
    const data = await resend.emails.send({
      from: 'Ticket System <onboarding@resend.dev>',
      to: [testEmail],
      subject: 'Test Email from Ticket System',
      html: '<h1>This is a test email</h1><p>If you receive this, the email service is working!</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Response:', data);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error sending test email:');
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testEmail();
