import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try multiple paths
const envPaths = [
  resolve(__dirname, '..', '.env.local'),
  resolve(process.cwd(), '.env.local'),
  resolve(__dirname, '.env.local')
];

console.log('📂 Looking for .env.local in:');
let envLoaded = false;

for (const envPath of envPaths) {
  console.log(`  - ${envPath}`);
  if (fs.existsSync(envPath)) {
    console.log(`    ✅ Found! Loading...`);
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
      envLoaded = true;
      console.log(`    ✅ Loaded successfully`);
      break;
    }
  }
}

if (!envLoaded) {
  console.error('❌ Could not find .env.local file!');
  console.log('📝 Make sure .env.local exists in your project root');
}

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Debug - Check if API key is loaded
console.log('🔑 API Key loaded:', process.env.BREVO_API_KEY ? '✅ Yes' : '❌ No');
if (process.env.BREVO_API_KEY) {
  console.log('🔑 API Key starts with:', process.env.BREVO_API_KEY.substring(0, 10) + '...');
}

app.post('/api/send-booking', async (req, res) => {
  try {
    const bookingData = req.body;

    // Check if API key exists
    if (!process.env.BREVO_API_KEY) {
      console.error('❌ BREVO_API_KEY is not set!');
      throw new Error('API key not configured. Please check your .env.local file.');
    }

    const emailData = {
      sender: {
        name: 'ΗλιοβαSeaλεμα',
        email: 'iliovasealema@gmail.com'
      },
      to: [{
        email: 'iliovasealema@gmail.com',
        name: 'ΗλιοβαSeaλεμα Owner'
      }],
      replyTo: {
        email: bookingData.email,
        name: bookingData.fullName
      },
      subject: `New Booking from ${bookingData.fullName}`,
      htmlContent: `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <h1 style="color: #1a2a4a; font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 15px;">
                🏠 New Booking Request - ΗλιοβαSeaλεμα
              </h1>
              
              <h2 style="color: #374151; font-size: 16px; margin-bottom: 10px;">Guest Information</h2>
              <p><strong>Name:</strong> {{params.fullName}}</p>
              <p><strong>Email:</strong> {{params.email}}</p>
              <p><strong>Phone:</strong> {{params.phone}}</p>
              
              <h2 style="color: #374151; font-size: 16px; margin-top: 20px; margin-bottom: 10px;">📅 Stay Details</h2>
              <p><strong>Check-in:</strong> {{params.checkIn}}</p>
              <p><strong>Check-out:</strong> {{params.checkOut}}</p>
              <p><strong>Nights:</strong> {{params.nights}}</p>
              
              <h2 style="color: #374151; font-size: 16px; margin-top: 20px; margin-bottom: 10px;">👤 Guests</h2>
              <p><strong>Adults:</strong> {{params.adults}}</p>
              <p><strong>Children:</strong> {{params.children}}</p>
              <p><strong>Infants:</strong> {{params.infants}}</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                <p>📧 Reply to this email to contact the guest directly.</p>
                <p style="font-size: 12px; margin-top: 5px;">This booking was submitted through your website.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      params: bookingData
    };

    console.log('📧 Sending booking email to Brevo...');
    console.log('📨 To:', emailData.to[0].email);
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Brevo API Error:', JSON.stringify(errorData, null, 2));
      throw new Error(errorData.message || 'Failed to send email');
    }

    const result = await response.json();
    console.log('✅ Email sent successfully! Message ID:', result.messageId);
    res.json({ success: true, messageId: result.messageId });

  } catch (error) {
    console.error('❌ Server Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to process booking' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📧 Booking API: POST http://localhost:${PORT}/api/send-booking`);
  console.log(`📨 Booking emails will be sent to: iliovasealema@gmail.com`);
});