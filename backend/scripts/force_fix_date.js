
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

async function forceFixDate() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await createConnection(dbConfig);
        
        console.log('Manually backdating ticket TTL0702260001 to Feb 7th...');
        
        // Set to Feb 7th 08:00:00 UTC
        await connection.query("UPDATE tickets SET open_date = '2026-02-07 08:00:00' WHERE ticket_number = 'TTL0702260001'");
        
        console.log('Ticket updated.');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

forceFixDate();
