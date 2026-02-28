import fs from 'fs';
import path from 'path';
import { db } from '../config/db.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import archiver from 'archiver';

// Initialize Tables
const initTables = async () => {
    try {
        // Expense Claims Header Table
        await db.query(`
      CREATE TABLE IF NOT EXISTS expense_claims (
        id INT AUTO_INCREMENT PRIMARY KEY,
        claim_number VARCHAR(50) UNIQUE,
        employee_id INT NOT NULL,
        report_name VARCHAR(255) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        status ENUM('Pending', 'Approved', 'Rejected', 'Draft', 'Submitted') DEFAULT 'Draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        rejection_reason TEXT DEFAULT NULL,
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

        // FIX: Ensure AUTO_INCREMENT is set and fix ID=0 issue
        const connection = await db.getConnection();
        try {
            // 1. Fix expense_claims
            const [claims0] = await connection.query("SELECT * FROM expense_claims WHERE id = 0");
            if (claims0.length > 0) {
                console.log("[Schema Fix] Found claim with ID 0. Updating...");
                const [maxIdResult] = await connection.query("SELECT MAX(id) as maxId FROM expense_claims");
                const newId = (maxIdResult[0].maxId || 0) + 1;
                await connection.query("UPDATE expense_items SET claim_id = ? WHERE claim_id = 0", [newId]);
                await connection.query("UPDATE expense_claims SET id = ? WHERE id = 0", [newId]);
            }
            await connection.query("ALTER TABLE expense_claims MODIFY COLUMN id INT AUTO_INCREMENT");

            // 2. Fix expense_items
            const [items0] = await connection.query("SELECT * FROM expense_items WHERE id = 0");
            if (items0.length > 0) {
                console.log("[Schema Fix] Found item with ID 0. Updating...");
                const [maxItemIdResult] = await connection.query("SELECT MAX(id) as maxId FROM expense_items");
                const newItemId = (maxItemIdResult[0].maxId || 0) + 1;
                await connection.query("UPDATE expense_items SET id = ? WHERE id = 0", [newItemId]);
            }
            await connection.query("ALTER TABLE expense_items MODIFY COLUMN id INT AUTO_INCREMENT");

            // 3. Add rejection_reason column if missing
            try {
                const [cols] = await connection.query("SHOW COLUMNS FROM expense_claims LIKE 'rejection_reason'");
                if (cols.length === 0) {
                    await connection.query("ALTER TABLE expense_claims ADD COLUMN rejection_reason TEXT DEFAULT NULL");
                }
            } catch (e) { }

            // 4. Add claim_number column if missing
            try {
                const [cols] = await connection.query("SHOW COLUMNS FROM expense_claims LIKE 'claim_number'");
                if (cols.length === 0) {
                    await connection.query("ALTER TABLE expense_claims ADD COLUMN claim_number VARCHAR(50) UNIQUE AFTER id");
                }
            } catch (e) { }

        } catch (fixErr) {
            console.warn("[Schema Fix] Attempted fix but got:", fixErr.message);
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error("Error creating reimbursement tables:", err);
    }
};

initTables();

// Helper to generate claim number
const generateClaimNumber = async (connection) => {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0');

    const prefix = `CLM-${dateStr}-`;

    // Find the latest claim number for today
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

// Submit or Save Draft
export const submitClaim = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const {
            employee_id,
            report_name,
            total_amount,
            expense_items,
            status = 'Submitted'
        } = req.body;

        let items = [];
        try {
            items = typeof expense_items === 'string' ? JSON.parse(expense_items) : Array.isArray(expense_items) ? expense_items : [];
        } catch (e) {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid expense_items payload' });
        }
        const files = req.files || [];

        const claimStatus = status === 'Save Draft' ? 'Draft' : (status === 'Pending' ? 'Submitted' : status);

        const claimNumber = await generateClaimNumber(connection);
        const [result] = await connection.query(
            `INSERT INTO expense_claims (employee_id, report_name, total_amount, status, claim_number) VALUES (?, ?, ?, ?, ?)`,
            [employee_id, report_name, total_amount, claimStatus, claimNumber]
        );
        const claimId = result.insertId;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            let receiptPath = null;
            const file = files.find(f => f.fieldname === `receipt_${i}`);
            if (file) {
                receiptPath = file.path.replace(/\\/g, '/');
            }

            let formattedDate = item.transaction_date;
            if (formattedDate && formattedDate.includes('T')) {
                formattedDate = formattedDate.split('T')[0];
            }

            await connection.query(
                `INSERT INTO expense_items (
                claim_id, expense_type, transaction_date, business_purpose, 
                vendor_name, city, payment_type, amount, billable, 
                project_no, event, domestic_intl, receipt_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    claimId, item.expense_type, formattedDate, item.business_purpose,
                    item.vendor_name, item.city, item.payment_type, item.amount,
                    item.billable, item.project_no, item.event,
                    item.domestic_intl, receiptPath
                ]
            );
        }

        await connection.commit();
        res.status(201).json({ message: `Claim ${claimStatus === 'Draft' ? 'saved as draft' : 'submitted'} successfully`, claimId });

    } catch (error) {
        await connection.rollback();
        console.error("Submit claim error:", error);
        res.status(500).json({ message: 'Failed to submit claim' });
    } finally {
        connection.release();
    }
};

// Update existing Draft
export const updateDraft = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const {
            report_name,
            total_amount,
            expense_items,
            status
        } = req.body;
        const files = req.files || [];

        const [check] = await connection.query(`SELECT status FROM expense_claims WHERE id = ?`, [id]);
        if (check.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Claim not found" });
        }
        if (check[0].status !== 'Draft') {
            await connection.rollback();
            return res.status(400).json({ message: "Cannot edit non-draft claims" });
        }

        const claimStatus = (status === 'Pending' || !status) ? 'Submitted' : status;

        let items = [];
        try {
            items = typeof expense_items === 'string' ? JSON.parse(expense_items) : expense_items;
            if (!Array.isArray(items)) items = [];
        } catch (e) {
            items = [];
        }

        await connection.query(
            `UPDATE expense_claims SET report_name=?, total_amount=?, status=? WHERE id=?`,
            [report_name, total_amount, claimStatus, id]
        );

        await connection.query(`DELETE FROM expense_items WHERE claim_id = ?`, [id]);

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            let receiptPath = item.receipt_path || null;

            const file = files.find(f => f.fieldname === `receipt_${i}`);
            if (file) {
                receiptPath = file.path.replace(/\\/g, '/');
            }

            let formattedDate = item.transaction_date;
            if (formattedDate && formattedDate.includes('T')) {
                formattedDate = formattedDate.split('T')[0];
            }

            await connection.query(
                `INSERT INTO expense_items (
                claim_id, expense_type, transaction_date, business_purpose, 
                vendor_name, city, payment_type, amount, billable, 
                project_no, event, domestic_intl, receipt_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id, item.expense_type, formattedDate, item.business_purpose,
                    item.vendor_name, item.city, item.payment_type, item.amount,
                    item.billable, item.project_no, item.event,
                    item.domestic_intl, receiptPath
                ]
            );
        }

        await connection.commit();
        res.json({ message: `Draft ${claimStatus === 'Submitted' ? 'submitted' : 'updated'} successfully`, claimId: id });

    } catch (error) {
        await connection.rollback();
        console.error("Update draft error:", error);
        res.status(500).json({ message: "Failed to update draft" });
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
        const [claims] = await db.query(`
            SELECT 
                ec.*, 
                u.name as employee_name, 
                u.email as employee_email
            FROM expense_claims ec
            JOIN users u ON ec.employee_id = u.id
            WHERE ec.status IN ('Submitted', 'Pending') 
            ORDER BY ec.created_at ASC
        `);
        res.json(claims);
    } catch (error) {
        console.error("Get pending claims error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Approved Expenses
export const getApprovedExpenses = async (req, res) => {
    try {
        const { groupBy } = req.query;

        const flatQuery = `
            SELECT 
                ei.*,
                ec.report_name,
                u.name as employee_name
            FROM expense_items ei
            JOIN expense_claims ec ON ei.claim_id = ec.id
            JOIN users u ON ec.employee_id = u.id
            WHERE ec.status = 'Approved'
            ORDER BY ei.transaction_date DESC
        `;

        const [flatResults] = await db.query(flatQuery);

        if (!groupBy) {
            return res.json(flatResults);
        }

        const grouped = flatResults.reduce((acc, item) => {
            let key = '';
            if (groupBy === 'date') {
                try {
                    key = new Date(item.transaction_date).toISOString().split('T')[0];
                } catch (e) { key = 'Invalid Date'; }
            } else if (groupBy === 'vendor') {
                key = item.vendor_name || 'Unknown Vendor';
            }

            if (!acc[key]) {
                acc[key] = { group_key: key, count: 0, total_amount: 0, items: [] };
            }

            acc[key].count++;
            acc[key].total_amount += parseFloat(item.amount || 0);
            acc[key].items.push(item);
            return acc;
        }, {});

        const parsedResults = Object.values(grouped).sort((a, b) => {
            if (groupBy === 'date') return new Date(b.group_key) - new Date(a.group_key);
            return b.total_amount - a.total_amount;
        });

        res.json(parsedResults);

    } catch (error) {
        console.error("Get approved expenses error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Claim Details
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
        const { status, rejection_reason } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        if (status === 'Rejected' && !rejection_reason) {
            return res.status(400).json({ message: "Rejection reason is required" });
        }

        await db.query(
            `UPDATE expense_claims SET status = ?, rejection_reason = ? WHERE id = ?`,
            [status, status === 'Rejected' ? rejection_reason : null, claimId]
        );

        if (status === 'Approved') {
            try {
                const [claimData] = await db.query(`
                    SELECT ec.*, u.name as employee_name
                    FROM expense_claims ec
                    JOIN users u ON ec.employee_id = u.id
                    WHERE ec.id = ?
                `, [claimId]);

                if (claimData.length > 0) {
                    const claim = claimData[0];
                    const { sendClaimStatusEmail } = await import('../utils/mailer.js');
                    const recipient = { name: claim.employee_name, email: 'selvakumar.r@tutelartechlabs.com' };
                    await sendClaimStatusEmail(recipient, claim, status);
                }
            } catch (mailErr) {
                console.error("[updateClaimStatus] Email error:", mailErr.message);
            }
        }

        res.json({ message: `Claim ${status} successfully` });
    } catch (error) {
        console.error("Update claim status error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Grouped Expenses
export const getGroupedExpenses = async (req, res) => {
    try {
        const { claimId } = req.params;
        const { by } = req.query;

        let query = "";
        if (by === 'date') {
            query = `
                SELECT DATE(transaction_date) as transaction_date, 
                       SUM(amount) AS total_amount, 
                       COUNT(*) AS expense_count
                FROM expense_items 
                WHERE claim_id = ? 
                GROUP BY DATE(transaction_date)
                ORDER BY transaction_date DESC
            `;
        } else if (by === 'vendor') {
            query = `
                SELECT vendor_name, 
                       SUM(amount) AS total_amount, 
                       COUNT(*) AS expense_count
                FROM expense_items 
                WHERE claim_id = ? 
                GROUP BY vendor_name
                ORDER BY total_amount DESC
            `;
        } else {
            return res.status(400).json({ message: "Invalid grouping parameter" });
        }

        const [groups] = await db.query(query, [claimId]);
        res.json(groups);

    } catch (error) {
        console.error("Get grouped expenses error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// -- EXPORTS --
export const exportExcel = async (req, res) => {
    try {
        const { claimId } = req.params;
        const [claim] = await db.query(`SELECT * FROM expense_claims WHERE id = ?`, [claimId]);
        const [items] = await db.query(`SELECT * FROM expense_items WHERE claim_id = ?`, [claimId]);

        if (claim.length === 0) return res.status(404).json({ message: "Claim not found" });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Expense Report');

        sheet.addRow(['Report Name:', claim[0].report_name]);
        sheet.addRow(['Total Amount:', claim[0].total_amount]);
        sheet.addRow(['Status:', claim[0].status]);
        sheet.addRow([]);
        sheet.addRow(['Date', 'Type', 'Vendor', 'Business Purpose', 'City', 'Payment', 'Amount', 'Billable']);

        items.forEach(item => {
            sheet.addRow([
                new Date(item.transaction_date).toLocaleDateString(),
                item.expense_type,
                item.vendor_name,
                item.business_purpose,
                item.city,
                item.payment_type,
                item.amount,
                item.billable ? 'Yes' : 'No'
            ]);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=claim_${claimId}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        res.status(500).json({ message: "Export failed" });
    }
};

export const exportPdf = async (req, res) => {
    try {
        const { claimId } = req.params;
        const [claim] = await db.query(`SELECT * FROM expense_claims WHERE id = ?`, [claimId]);
        const [items] = await db.query(`SELECT * FROM expense_items WHERE claim_id = ?`, [claimId]);

        if (claim.length === 0) return res.status(404).json({ message: "Claim not found" });

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=claim_${claimId}.pdf`);
        doc.pipe(res);

        doc.fontSize(20).text('Expense Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Report Name: ${claim[0].report_name}`);
        doc.text(`Total Amount: ${claim[0].total_amount}`);
        doc.moveDown();

        items.forEach(item => {
            doc.fontSize(10).text(`${new Date(item.transaction_date).toLocaleDateString()} - ${item.expense_type} - ${item.vendor_name} - Rs.${item.amount}`);
            doc.moveDown(0.5);
        });

        doc.end();

    } catch (error) {
        res.status(500).json({ message: "Export failed" });
    }
};

export const downloadReceiptsZip = async (req, res) => {
    try {
        const { claimId } = req.params;
        const [items] = await db.query(`SELECT receipt_path FROM expense_items WHERE claim_id = ? AND receipt_path IS NOT NULL`, [claimId]);

        if (items.length === 0) return res.status(404).json({ message: "No receipts found" });

        const archive = archiver('zip', { zlib: { level: 9 } });
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=receipts_${claimId}.zip`);
        archive.pipe(res);

        items.forEach((item, index) => {
            if (fs.existsSync(item.receipt_path)) {
                archive.file(item.receipt_path, { name: `receipt_${index + 1}_${path.basename(item.receipt_path)}` });
            }
        });

        await archive.finalize();

    } catch (error) {
        res.status(500).json({ message: "ZIP generation failed" });
    }
};

export const exportItemsBulk = async (req, res) => {
    try {
        const { itemIds } = req.body;
        const { type } = req.query;

        if (!itemIds || itemIds.length === 0) return res.status(400).json({ message: "No items selected" });

        const query = `
            SELECT ei.*, ec.report_name, u.name as employee_name
            FROM expense_items ei
            JOIN expense_claims ec ON ei.claim_id = ec.id
            JOIN users u ON ec.employee_id = u.id
            WHERE ei.id IN (?)
        `;

        const [items] = await db.query(query, [itemIds]);

        if (items.length === 0) return res.status(404).json({ message: "Selected items not found" });

        if (type === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Selected Expenses');
            sheet.addRow(['Date', 'Employee', 'Report', 'Type', 'Vendor', 'Business Purpose', 'City', 'Payment', 'Amount', 'Billable']);

            items.forEach(item => {
                sheet.addRow([
                    new Date(item.transaction_date).toLocaleDateString(),
                    item.employee_name,
                    item.report_name,
                    item.expense_type,
                    item.vendor_name,
                    item.business_purpose,
                    item.city,
                    item.payment_type,
                    item.amount,
                    item.billable ? 'Yes' : 'No'
                ]);
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=expenses_export.xlsx`);
            await workbook.xlsx.write(res);
            res.end();

        } else if (type === 'pdf') {
            const doc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=expenses_export.pdf`);
            doc.pipe(res);
            doc.fontSize(20).text('Expense Export', { align: 'center' });
            doc.moveDown();

            items.forEach(item => {
                doc.fontSize(10).text(`${new Date(item.transaction_date).toLocaleDateString()} - ${item.employee_name} (${item.report_name})`);
                doc.fontSize(12).text(`${item.expense_type} - ${item.vendor_name} - Rs.${item.amount}`);
                doc.moveDown(0.5);
                doc.moveTo(doc.x, doc.y).lineTo(500, doc.y).stroke();
                doc.moveDown(0.5);
            });

            doc.end();
        }

    } catch (error) {
        res.status(500).json({ message: "Export failed" });
    }
};
