/**
 * Replaces all 2026 holidays in the DB with the official TTL holiday list.
 * Run with: node seed_holidays_2026.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) { console.error('❌ No MONGO_URI in .env'); process.exit(1); }

await mongoose.connect(MONGO_URI);
console.log('✅ Connected to MongoDB');

const Holiday = mongoose.model('Holiday', new mongoose.Schema({
  title: String,
  date: String,
  type: String,
  location: String,
  department: String,
  description: String,
}, { strict: false }));

const holidays2026 = [
  { title: "New Year's Day",          date: '2026-01-01', type: 'National',  description: 'New Year\'s Day' },
  { title: 'Pongal',                  date: '2026-01-15', type: 'Regional',  description: 'Pongal harvest festival' },
  { title: 'Republic Day',            date: '2026-01-26', type: 'National',  description: 'Republic Day' },
  { title: "Telugu New Year's Day",   date: '2026-03-19', type: 'Regional',  description: 'Telugu New Year (Ugadi)' },
  { title: "Ramzan (Idul'l Fitr)",    date: '2026-03-21', type: 'Regional',  description: "Ramzan / Eid ul-Fitr" },
  { title: 'Good Friday',             date: '2026-04-03', type: 'National',  description: 'Good Friday' },
  { title: 'May Day',                 date: '2026-05-01', type: 'National',  description: 'International Labour Day' },
  { title: 'Independence Day',        date: '2026-08-15', type: 'National',  description: 'Independence Day' },
  { title: 'Vinayakar Chathurthi',    date: '2026-09-14', type: 'Regional',  description: 'Ganesh Chaturthi' },
  { title: 'Ayutha Pooja',            date: '2026-10-19', type: 'Regional',  description: 'Ayutha Pooja / Saraswati Puja' },
  { title: 'Deepavali',               date: '2026-11-08', type: 'National',  description: 'Festival of Lights' },
  { title: 'Christmas',               date: '2026-12-25', type: 'National',  description: 'Christmas Day' },
];

// Delete all existing 2026 holidays
const deleted = await Holiday.deleteMany({ date: { $regex: '^2026-' } });
console.log(`🗑️  Deleted ${deleted.deletedCount} existing 2026 holiday(s)`);

// Insert new list
const docs = holidays2026.map(h => ({ ...h, location: 'All', department: 'All' }));
await Holiday.insertMany(docs);
console.log(`✅ Inserted ${docs.length} holidays for 2026:\n`);
docs.forEach(h => console.log(`   ${h.date}  ${h.title}`));

await mongoose.disconnect();
console.log('\n✅ Done!');
