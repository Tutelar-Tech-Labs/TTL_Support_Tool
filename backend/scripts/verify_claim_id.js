import { db } from '../config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const generateClaimNumber = async (connection) => {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0');

    const prefix = `CLM-${dateStr}-`;

    const [result] = await connection.query(
        "SELECT claim_number FROM expense_claims WHERE claim_number LIKE ? ORDER BY claim_number DESC LIMIT 1",
        [`${prefix}%`]
    );

    let nextCount = 1;
    if (result.length > 0) {
        const lastClaimNumber = result[0].claim_number;
        const lastCountStr = lastClaimNumber.substring(prefix.length);
        nextCount = parseInt(lastCountStr, 10) + 1;
    }

    return `${prefix}${nextCount.toString().padStart(4, '0')}`;
};

const runTest = async () => {
    console.log("Using config:", {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: '****',
        database: process.env.DB_NAME
    });

    const connection = await db.getConnection();
    try {
        console.log("Connected to DB.");
        const claim1 = await generateClaimNumber(connection);
        console.log("Generated Claim Number 1:", claim1);

        // Simulate an existing claim in DB
        await connection.query(
            "INSERT INTO expense_claims (employee_id, report_name, total_amount, claim_number, status) VALUES (?, ?, ?, ?, ?)",
            [1, 'Test Claim', 100, claim1, 'Draft']
        );

        const claim2 = await generateClaimNumber(connection);
        console.log("Generated Claim Number 2 (should increment):", claim2);

        // Cleanup
        await connection.query("DELETE FROM expense_claims WHERE claim_number = ?", [claim1]);
        console.log("Cleaned up test claim.");

        if (claim1.includes('-') && claim2.endsWith('0002')) {
            console.log("SUCCESS: Claim ID format and increment are working as expected.");
        } else {
            console.error("FAILURE: Unexpected Claim ID format.");
        }

    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        connection.release();
        process.exit();
    }
};

runTest();
