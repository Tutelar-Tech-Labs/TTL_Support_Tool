/**
 * One-time fix script: reset all users' paidLeaves to the correct value.
 * Correct value = 12 (base) + number of approved CompOffRequests for that user.
 * Run with: node fix_paid_leaves.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ No MONGO_URI found in .env');
  process.exit(1);
}

await mongoose.connect(MONGO_URI);
console.log('✅ Connected to MongoDB');

const User = mongoose.model('MongoUser', new mongoose.Schema({
  fullName: String,
  email: String,
  paidLeaves: Number,
}, { strict: false }));

const CompOff = mongoose.model('CompOffRequest', new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  status: String,
}, { strict: false }));

const users = await User.find({});
console.log(`Found ${users.length} users\n`);

for (const user of users) {
  const approvedCount = await CompOff.countDocuments({ userId: user._id, status: 'Approved' });
  const correctBalance = 12 + approvedCount;
  
  console.log(`  ${user.fullName} (${user.email})`);
  console.log(`    paidLeaves in DB : ${user.paidLeaves ?? 'not set'}`);
  console.log(`    approved comp offs: ${approvedCount}`);
  console.log(`    setting to: ${correctBalance}`);
  
  await User.findByIdAndUpdate(user._id, { $set: { paidLeaves: correctBalance } });
  console.log(`    ✅ Updated\n`);
}

console.log('✅ All users fixed!');
await mongoose.disconnect();
