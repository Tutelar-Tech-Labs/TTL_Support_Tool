import { db } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// In-memory OTP store: { email -> { otp, expiresAt } }
const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert new user
    const [result] = await db.query(
      "INSERT INTO users (name, email, phone, password_hash, role, profile_picture, home_address, aadhar_number, pan_number, blood_group, emergency_contact, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [
        name,
        email,
        req.body.phone || null,
        passwordHash,
        role === 'sales' ? 'sales' : 'engineer',
        null,
        null,
        null,
        null,
        null,
        null
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Signup successful"
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate Token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      status: "success",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profile_picture,
        homeAddress: user.home_address,
        aadharNumber: user.aadhar_number,
        panNumber: user.pan_number,
        bloodGroup: user.blood_group,
        emergencyContact: user.emergency_contact
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, name, email, phone, role FROM users ORDER BY name ASC");
    res.json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
};


export const getMe = async (req, res) => {
  try {
    const user = req.user; // Attached by verifyToken middleware
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      status: "success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profile_picture,
        homeAddress: user.home_address,
        aadharNumber: user.aadhar_number,
        panNumber: user.pan_number,
        bloodGroup: user.blood_group,
        emergencyContact: user.emergency_contact
      }
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

// ── Forgot Password ─────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const [users] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      // Don't reveal whether the account exists
      return res.json({ message: "If that email is registered, an OTP has been sent." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore.set(email.toLowerCase(), { otp, expiresAt });

    await transporter.sendMail({
      from: `"Tutelar Tech Labs" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP – Tutelar Tech Labs",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border-radius:12px;border:1px solid #e2e8f0">
          <h2 style="color:#6366f1;margin-bottom:8px">Password Reset</h2>
          <p style="color:#475569">Use the OTP below to reset your password. It expires in <strong>5 minutes</strong>.</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1e293b;background:#f1f5f9;padding:20px;border-radius:8px;text-align:center;margin:24px 0">${otp}</div>
          <p style="color:#94a3b8;font-size:13px">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: "If that email is registered, an OTP has been sent." });
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

// ── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: "Email, OTP and new password are required" });

    const record = otpStore.get(email.toLowerCase());
    if (!record) return res.status(400).json({ message: "No OTP found. Please request a new one." });
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }
    if (record.otp !== otp.trim())
      return res.status(400).json({ message: "Invalid OTP. Please try again." });

    // OTP valid – update password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await db.query("UPDATE users SET password_hash = ? WHERE email = ?", [passwordHash, email]);
    otpStore.delete(email.toLowerCase());

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ message: "Server error during password reset" });
  }
};
