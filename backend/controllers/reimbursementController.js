import { db } from "../config/db.js";

// Initialize Tables
const initTables = async () => {
    try {
        // Expense Claims Header Table
        await db.query(`
      CREATE TABLE IF NOT EXISTS expense_claims (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        report_name VARCHAR(255) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES users(id)
      )
    `);

        // Expense Items Detail Table
        await db.query(`
      CREATE TABLE IF NOT EXISTS expense_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        claim_id INT NOT NULL,
        expense_type VARCHAR(100) NOT NULL,
        transaction_date DATE NOT NULL,
        business_purpose TEXT,
        vendor_name VARCHAR(255),
        city VARCHAR(100),
        payment_type VARCHAR(100),
        amount DECIMAL(10,2) NOT NULL,
        billable BOOLEAN DEFAULT FALSE,
        project_no VARCHAR(50),
        event VARCHAR(100),
        domestic_intl ENUM('Domestic', 'International') DEFAULT 'Domestic',
        receipt_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (claim_id) REFERENCES expense_claims(id) ON DELETE CASCADE
      )
    `);

        console.log("Reimbursement tables checked/created");
    } catch (err) {
        console.error("Error creating reimbursement tables:", err);
    }
};

initTables();

// Submit a new claim
export const submitClaim = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const {
            employee_id,
            report_name,
            total_amount,
            expense_items
        } = req.body;

        const items = JSON.parse(expense_items);
        const files = req.files; // Array of files

        // 1. Create Handle
        const [result] = await connection.query(
            `INSERT INTO expense_claims (employee_id, report_name, total_amount) VALUES (?, ?, ?)`,
            [employee_id, report_name, total_amount]
        );
        const claimId = result.insertId;

        // 2. Insert Items
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            // Match file to item index if provided
            // We assume the frontend sends files in the same order or keys
            // Simplifying assumption: Frontend sends files with fieldname 'receipts'
            // And we map them 1:1 if needed, or we might need a better mapping strategy.
            // BETTER STRATEGY: Frontend sends a unique ID for each item and we map file fieldname to that ID?
            // OR: Simpler - Let's assume for now 1 item = 1 receipt limit per row, and we handle the mapping.

            let receiptPath = null;
            // Find file for this item index (if uploaded)
            // This is tricky with simple array uploads. 
            // Let's assume files are uploaded with fieldname `receipt_${index}`
            const file = files.find(f => f.fieldname === `receipt_${i}`);
            if (file) {
                receiptPath = file.path.replace(/\\/g, '/'); // Normalize path
            }

            await connection.query(
                `INSERT INTO expense_items (
                claim_id, expense_type, transaction_date, business_purpose, 
                vendor_name, city, payment_type, amount, billable, 
                project_no, event, domestic_intl, receipt_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    claimId, item.expense_type, item.transaction_date, item.business_purpose,
                    item.vendor_name, item.city, item.payment_type, item.amount,
                    item.billable, item.project_no, item.event,
                    item.domestic_intl, receiptPath
                ]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Claim submitted successfully', claimId });

    } catch (error) {
        await connection.rollback();
        console.error("Submit claim error:", error);
        res.status(500).json({ message: 'Failed to submit claim' });
    } finally {
        connection.release();
    }
};

// Get Claims for Employee
export const getMyClaims = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const [claims] = await db.query(
            `SELECT * FROM expense_claims WHERE employee_id = ? ORDER BY created_at DESC`,
            [employeeId]
        );
        res.json(claims);
    } catch (error) {
        console.error("Get my claims error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Pending Claims (Admin)
export const getPendingClaims = async (req, res) => {
    try {
        // Only return pending claims, join with user info
        const [claims] = await db.query(`
            SELECT 
                ec.*, 
                u.name as employee_name, 
                u.email as employee_email
            FROM expense_claims ec
            JOIN users u ON ec.employee_id = u.id
            WHERE ec.status = 'Pending'
            ORDER BY ec.created_at ASC
        `);
        res.json(claims);
    } catch (error) {
        console.error("Get pending claims error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Claim Details (Items)
export const getClaimDetails = async (req, res) => {
    try {
        const { claimId } = req.params;
        const [items] = await db.query(
            `SELECT * FROM expense_items WHERE claim_id = ?`,
            [claimId]
        );
        res.json(items);
    } catch (error) {
        console.error("Get claim details error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update Claim Status
export const updateClaimStatus = async (req, res) => {
    try {
        const { claimId } = req.params;
        const { status } = req.body; // 'Approved' or 'Rejected'

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        await db.query(
            `UPDATE expense_claims SET status = ? WHERE id = ?`,
            [status, claimId]
        );

        res.json({ message: `Claim ${status} successfully` });
    } catch (error) {
        console.error("Update claim status error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
