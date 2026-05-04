import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Holiday from '../models/mongo/Holiday.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const holidays = [
  { date: '2026-01-14', title: 'Makara Sankranti', type: 'National' },
  { date: '2026-01-26', title: 'Republic Day', type: 'National' },
  { date: '2026-02-15', title: 'Maha Shivratri', type: 'National' },
  { date: '2026-03-20', title: 'Ugadi', type: 'Regional' },
  { date: '2026-03-21', title: 'Id-ul-Fitr', type: 'National' },
  { date: '2026-03-31', title: 'Mahavir Jayanti', type: 'National' },
  { date: '2026-04-03', title: 'Good Friday', type: 'National' },
  { date: '2026-04-14', title: 'Dr. B.R. Ambedkar Jayanti', type: 'National' },
  { date: '2026-04-20', title: 'Basava Jayanti', type: 'Regional' },
  { date: '2026-05-01', title: 'May Day', type: 'National' },
  { date: '2026-05-27', title: 'Bakrid Eid or Eid al Adha', type: 'National' },
  { date: '2026-06-26', title: 'Muharram', type: 'National' },
  { date: '2026-08-15', title: 'Independence Day', type: 'National' },
  { date: '2026-08-25', title: 'Eid e Milad', type: 'National' },
  { date: '2026-09-14', title: 'Ganesh Chaturthi', type: 'National' },
  { date: '2026-10-02', title: 'Gandhi Jayanti', type: 'National' },
  { date: '2026-10-10', title: 'Mahalaya Amavasye', type: 'Regional' },
  { date: '2026-10-11', title: 'Maharaja Agrasen Jayanti', type: 'Regional' },
  { date: '2026-10-19', title: 'Maha Navami', type: 'Regional' },
  { date: '2026-10-20', title: 'Vijay Dashami', type: 'National' },
  { date: '2026-10-26', title: 'Maharishi Valmiki’s Birthday', type: 'Regional' },
  { date: '2026-11-01', title: 'Kannada Rajyothsava', type: 'Regional' },
  { date: '2026-11-08', title: 'Diwali', type: 'National' },
  { date: '2026-11-09', title: 'Deepavali Holiday', type: 'National' },
  { date: '2026-11-27', title: 'Kanakadasa Jayanti', type: 'Regional' },
  { date: '2026-12-25', title: 'Christmas', type: 'National' }
];

const seedHolidays = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ttl_support_tool';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB...');

    for (const holiday of holidays) {
      await Holiday.findOneAndUpdate(
        { date: holiday.date },
        holiday,
        { upsert: true, new: true }
      );
      console.log(`Seeded holiday: ${holiday.title} (${holiday.date})`);
    }

    console.log('All holidays seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding holidays:', error);
    process.exit(1);
  }
};

seedHolidays();
