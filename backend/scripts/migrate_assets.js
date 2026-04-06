import { db } from "../config/db.js";

async function migrateAssetsTable() {
  const connection = await db.getConnection();
  try {
    console.log("Starting assets table migration...");

    await connection.beginTransaction();

    // 1. Modify user_id to be nullable
    console.log("Modifying user_id to be nullable...");
    await connection.query(`ALTER TABLE assets MODIFY user_id INT NULL`);

    // 2. Add customer_id (if not exists)
    console.log("Adding customer_id column...");
    try {
      await connection.query(`ALTER TABLE assets ADD COLUMN customer_id INT NULL`);
      await connection.query(`ALTER TABLE assets ADD FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL`);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("customer_id already exists, skipping...");
      } else {
        throw e;
      }
    }

    // 3. Add specs column (if not exists)
    console.log("Adding specs column...");
    try {
      await connection.query(`ALTER TABLE assets ADD COLUMN specs TEXT NULL`);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("specs already exists, skipping...");
      } else {
        throw e;
      }
    }

    // 4. Update status enum
    console.log("Updating status ENUM...");
    // We recreate the ENUM with the new values. 
    // New values: 'available', 'assigned', 'assigned_customer', 'returned', 'damaged'
    await connection.query(`
      ALTER TABLE assets 
      MODIFY status ENUM('available', 'assigned', 'assigned_customer', 'returned', 'damaged') DEFAULT 'available'
    `);

    // 5. Update existing 'assigned' assets that have no user_id (if any, though they shouldn't exist) to 'available'
    // Actually, any existing row has user_id NOT NULL because of the old schema, so they are properly 'assigned'
    
    await connection.commit();
    console.log("✅ Assets table migration completed successfully!");
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error migrating assets table:", error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

migrateAssetsTable();
