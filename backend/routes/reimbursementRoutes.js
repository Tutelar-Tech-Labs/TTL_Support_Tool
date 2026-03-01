import express from "express";
import {
    submitClaim,
    getMyClaims,
    getPendingClaims,
    getClaimDetails,
    updateClaimStatus,
    updateDraft,
    getGroupedExpenses,
    getApprovedExpenses,
    exportExcel,
    exportPdf,
    downloadReceiptsZip,
    exportItemsBulk
} from "../controllers/reimbursementController.js";
import { uploadReceipt } from "../middlewares/uploadMiddleware.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply authentication to all reimbursement routes
router.use(verifyToken);

// Allow uploading multiple files. 
// Ideally we expect 'receipt_0', 'receipt_1' etc. so strictly 'array' might not work if field names differ.
// But we can use `any()` to accept all files and sort them in controller.
router.post("/submit", uploadReceipt.any(), submitClaim);

router.get("/my-claims/:employeeId", getMyClaims);
router.get("/pending", getPendingClaims);
router.get("/approved-expenses", getApprovedExpenses);
router.get("/details/:claimId", getClaimDetails);
router.get("/details/:claimId/grouped", getGroupedExpenses);
router.get("/export/excel/:claimId", exportExcel);
router.get("/export/pdf/:claimId", exportPdf);
router.get("/export/zip/:claimId", downloadReceiptsZip);
router.post("/export/items", exportItemsBulk); // New bulk export endpoint

router.put("/draft/:id", uploadReceipt.any(), updateDraft);
router.put("/:claimId/status", updateClaimStatus);

export default router;
