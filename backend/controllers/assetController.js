import { db } from "../config/db.js";

// @desc    Get all assets
// @route   GET /api/assets
// @access  Private/Admin
export const getAssets = async (req, res) => {
  try {
    const [assets] = await db.query(`
      SELECT 
        a.*, 
        u.name as user_name, u.email as user_email,
        c.name as customer_name
      FROM assets a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN customers c ON a.customer_id = c.id
      ORDER BY a.created_at DESC
    `);
    res.json(assets);
  } catch (error) {
    console.error("Get assets error:", error);
    res.status(500).json({ message: "Server error fetching assets" });
  }
};

// @desc    Get assets for a specific employee
// @route   GET /api/assets/user/:userId
// @access  Private/Admin
export const getUserAssets = async (req, res) => {
  try {
    const { userId } = req.params;
    const [assets] = await db.query("SELECT * FROM assets WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    res.json(assets);
  } catch (error) {
    console.error("Get user assets error:", error);
    res.status(500).json({ message: "Server error fetching user assets" });
  }
};

// @desc    Create/Assign new asset
// @route   POST /api/assets
// @access  Private/Admin
export const createAsset = async (req, res) => {
  try {
    const { user_id, customer_id, asset_type, model_no, serial_no, specs, given_date, status } = req.body;
    
    if (!asset_type) {
      return res.status(400).json({ message: "Asset Type is required" });
    }

    const assignedStatus = status || 'available';

    const [result] = await db.query(
      "INSERT INTO assets (user_id, customer_id, asset_type, model_no, serial_no, specs, given_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [user_id || null, customer_id || null, asset_type, model_no || null, serial_no || null, specs || null, given_date || new Date(), assignedStatus]
    );

    res.status(201).json({
      status: "success",
      message: "Asset created successfully",
      assetId: result.insertId
    });
  } catch (error) {
    console.error("Create asset error:", error);
    res.status(500).json({ message: "Server error creating asset" });
  }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private/Admin
export const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, customer_id, asset_type, model_no, serial_no, specs, given_date, return_date, status } = req.body;

    const [result] = await db.query(
      "UPDATE assets SET user_id = ?, customer_id = ?, asset_type = ?, model_no = ?, serial_no = ?, specs = ?, given_date = ?, return_date = ?, status = ? WHERE id = ?",
      [user_id || null, customer_id || null, asset_type, model_no || null, serial_no || null, specs || null, given_date || null, return_date || null, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.json({ status: "success", message: "Asset updated successfully" });
  } catch (error) {
    console.error("Update asset error:", error);
    res.status(500).json({ message: "Server error updating asset" });
  }
};

// @desc    Delete asset record
// @route   DELETE /api/assets/:id
// @access  Private/Admin
export const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM assets WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.json({ status: "success", message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Delete asset error:", error);
    res.status(500).json({ message: "Server error deleting asset" });
  }
};
