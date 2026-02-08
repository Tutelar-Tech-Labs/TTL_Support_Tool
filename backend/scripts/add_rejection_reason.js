
import { db } from '../config/db.js';

const addRejectionReasonColumn = async () => {
  try {
    const connection = await db.getConnection();
    console.log('Checking expense_claims table for rejection_reason column...');

    const [columns] = await connection.query(`SHOW COLUMNS FROM expense_claims LIKE 'rejection_reason'`);
    
    if (columns.length === 0) {
      console.log('Adding rejection_reason column...');
      await connection.query(`ALTER TABLE expense_claims ADD COLUMN rejection_reason TEXT DEFAULT NULL`);
      console.log('rejection_reason column added successfully.');
    } else {
      console.log('rejection_reason column already exists.');
    }

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
};

addRejectionReasonColumn();
