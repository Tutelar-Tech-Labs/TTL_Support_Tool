import { sendEmail } from '../utils/mailer.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const testMail = async () => {
    try {
        console.log('Testing email configuration...');
        console.log('Using EMAIL_USER:', process.env.EMAIL_USER);

        await sendEmail({
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email - Tutelar Tech Labs Support Tool',
            html: '<h1>SMTP Configuration Working!</h1><p>This is a test email to verify the mailer utility connection.</p>'
        });

        console.log('✅ Test email sent successfully!');
    } catch (error) {
        console.error('❌ Test email failed:', error);
    }
};

testMail();