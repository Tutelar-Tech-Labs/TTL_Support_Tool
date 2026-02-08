
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

async function inspectTimeline() {
    let connection;
    try {
        connection = await createConnection(dbConfig);
        const [rows] = await connection.query("SELECT id, ticket_number, open_date, timeline FROM tickets WHERE ticket_number = 'TTL0702260001'");
        
        if (rows.length > 0) {
            console.log('Ticket:', rows[0].ticket_number);
            console.log('Current Open Date:', rows[0].open_date);
            console.log('Timeline:', rows[0].timeline);
            
            // Try to parse timeline and find earliest date
            let timeline = rows[0].timeline;
            if (typeof timeline === 'string') {
                timeline = JSON.parse(timeline);
            }
            
            if (Array.isArray(timeline)) {
                 // Sort by date logic from frontend
                 const getTimestamp = (dateStr) => {
                    const s = String(dateStr).trim();
                    const d = new Date(s);
                    return isNaN(d.getTime()) ? 0 : d.getTime();
                 };
                 
                 const sorted = timeline.sort((a, b) => getTimestamp(a.date) - getTimestamp(b.date));
                 if (sorted.length > 0) {
                     console.log('Earliest Timeline Event:', sorted[0]);
                 }
            }
        }
        
    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.end();
    }
}

inspectTimeline();
