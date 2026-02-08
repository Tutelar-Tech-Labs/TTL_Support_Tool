
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

async function fixFutureDates() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await createConnection(dbConfig);
        
        console.log('Checking for future-dated tickets...');
        
        // Find tickets where open_date is in the future
        // We use UTC_TIMESTAMP() to compare against current UTC time
        const [tickets] = await connection.query("SELECT id, ticket_number, open_date FROM tickets WHERE open_date > UTC_TIMESTAMP()");
        
        if (tickets.length > 0) {
            console.log(`Found ${tickets.length} future-dated tickets. Fixing...`);
            for (const t of tickets) {
                console.log(`Fixing ticket ${t.ticket_number} (Date: ${t.open_date})`);
                // Update to NOW()
                await connection.query("UPDATE tickets SET open_date = UTC_TIMESTAMP() WHERE id = ?", [t.id]);
            }
            console.log('All future-dated tickets updated to current UTC time.');
        } else {
            console.log('No future-dated tickets found.');
        }
        
    } catch (error) {
        console.error('Error fixing dates:', error);
    } finally {
        if (connection) await connection.end();
    }
}

fixFutureDates();
