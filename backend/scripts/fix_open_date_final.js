
import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ticket_system_db'
};

async function fixOpenDate() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await createConnection(dbConfig);
        
        console.log('Updating open_date for ticket TTL0702260001...');
        
        // Update to '2026-02-07 00:00:00' to ensure it's definitely in the past relative to now
        // The earliest timeline event was '2026-02-07T18:36:29.288' (Local/Mixed)
        // Let's set open_date to 2026-02-07 00:00:00 UTC to be safe
        
        await connection.query("UPDATE tickets SET open_date = '2026-02-07 00:00:00' WHERE ticket_number = 'TTL0702260001'");
        
        console.log('Ticket updated successfully.');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

fixOpenDate();
