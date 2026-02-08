
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

async function checkTicket() {
    let connection;
    try {
        connection = await createConnection(dbConfig);
        const [rows] = await connection.query("SELECT id, ticket_number, open_date FROM tickets WHERE ticket_number = 'TTL0702260001'");
        console.log('Ticket:', rows);
        
        const [time] = await connection.query("SELECT NOW() as db_now, UTC_TIMESTAMP() as db_utc");
        console.log('DB Time:', time);
        
    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.end();
    }
}

checkTicket();
