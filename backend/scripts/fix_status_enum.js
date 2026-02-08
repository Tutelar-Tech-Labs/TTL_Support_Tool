
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

async function fixEnum() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await createConnection(dbConfig);
        
        console.log('Checking tickets table schema...');
        
        // Alter the table to ensure the ENUM includes 'Pending from Customer'
        const query = "ALTER TABLE tickets MODIFY COLUMN status ENUM('Open', 'In Progress', 'Pending from Customer', 'Closed') DEFAULT 'Open'";
        
        console.log('Executing:', query);
        await connection.query(query);
        
        console.log('Successfully updated tickets status ENUM.');
        
    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        if (connection) await connection.end();
    }
}

fixEnum();
