import express from "express";
import {
    submitClaim,
    getMyClaims,
    getPendingClaims,
    getClaimDetails,
    updateClaimStatus
} from "../controllers/reimbursementController.js";
import { uploadReceipt } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Allow uploading multiple files. 
// Ideally we expect 'receipt_0', 'receipt_1' etc. so strictly 'array' might not work if field names differ.
// But we can use `any()` to accept all files and sort them in controller.
router.post("/submit", uploadReceipt.any(), submitClaim);

router.get("/my-claims/:employeeId", getMyClaims);
router.get("/pending", getPendingClaims);
router.get("/details/:claimId", getClaimDetails);
router.put("/:claimId/status", updateClaimStatus);

export default router;
