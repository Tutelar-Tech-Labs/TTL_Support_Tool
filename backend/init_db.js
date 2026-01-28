import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
};

async function initDb() {
    let conn;
    try {
        console.log("Connecting to MySQL server...");
        conn = await mysql.createConnection(dbConfig);
        console.log("Connected.");

        console.log("Creating database 'ttl' if not exists...");
        await conn.query("CREATE DATABASE IF NOT EXISTS ttl");
        console.log("Database created or already exists.");

        await conn.changeUser({ database: 'ttl' });

        console.log("Creating 'users' table...");
        await conn.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                phone VARCHAR(20),
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('sales', 'engineer', 'admin') DEFAULT 'engineer',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Creating 'tickets' table...");
        await conn.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ticket_number VARCHAR(50) UNIQUE,
                severity ENUM('Critical', 'High', 'Medium', 'Low'),
                ticket_type VARCHAR(50),
                technology_domain VARCHAR(100),
                customer_name VARCHAR(255),
                customer_serial_no VARCHAR(100),
                tsg_id VARCHAR(50),
                csp_id VARCHAR(50),
                contact_name VARCHAR(255),
                contact_phone VARCHAR(50),
                contact_email VARCHAR(255),
                assigned_engineer VARCHAR(255),
                engineer_phone VARCHAR(50),
                engineer_email VARCHAR(255),
                issue_subject VARCHAR(255),
                issue_description TEXT,
                oem_tac_involved BOOLEAN DEFAULT FALSE,
                tac_case_number VARCHAR(50),
                engineer_remarks TEXT,
                problem_resolution TEXT,
                reference_url VARCHAR(255),
                open_date DATETIME,
                close_date DATETIME,
                status VARCHAR(50) DEFAULT 'Open',
                created_by INT,
                timeline JSON,
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        `);

        console.log("Creating 'ticket_attachments' table...");
        await conn.query(`
            CREATE TABLE IF NOT EXISTS ticket_attachments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ticket_id INT,
                file_name VARCHAR(255),
                file_path TEXT,
                file_type VARCHAR(50),
                file_size INT,
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
            )
        `);

        console.log("Database initialization completed successfully.");

    } catch (error) {
        console.error("Initialization Error:", error);
    } finally {
        if (conn) await conn.end();
    }
}

initDb();
