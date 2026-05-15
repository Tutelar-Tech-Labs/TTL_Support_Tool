import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import approvalRoutes from "./routes/approvalRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import salesApprovalRoutes from "./routes/salesApprovalRoutes.js";
import reimbursementRoutes from "./routes/reimbursementRoutes.js";

import connectMongoDB from "./config/mongo.js";
import mongoRoutes from "./routes/mongoRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import startMidnightCron from "./services/midnightPunchCleanup.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder first, then fallback to root
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

connectMongoDB(); // Connect to MongoDB

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for easier local testing/external APIs if needed
  crossOriginResourcePolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Serve built frontend files (Production)
app.use(express.static(path.join(__dirname, '../dist')));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/sales-approvals", salesApprovalRoutes);
app.use("/api/reimbursement", reimbursementRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api", mongoRoutes); // Mount attendance routes


// Fallback for SPA: Redirect all non-API/non-static routes to index.html
app.get("*", (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).send("API route not found");
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  startMidnightCron(); // Start midnight punch cleanup cron job
});

