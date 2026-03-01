
import { db } from './config/db.js';

const ensureColumnExists = async () => {
    try {
        const connection = await db.getConnection();
        console.log('Checking expense_claims table for claim_number column...');

        const [columns] = await connection.query(`SHOW COLUMNS FROM expense_claims LIKE 'claim_number'`);
        
        if (columns.length === 0) {
            console.log('Adding claim_number column...');
            await connection.query(`ALTER TABLE expense_claims ADD COLUMN claim_number VARCHAR(50) UNIQUE AFTER id`);
            console.log('claim_number column added successfully.');
        } else {
            console.log('claim_number column already exists.');
        }

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
};

ensureColumnExists();
