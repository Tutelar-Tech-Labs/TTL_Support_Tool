import express from "express";
import { 
  requestSalesApproval, 
  getSalesApprovals, 
  updateSalesApproval,
  getApprovalStatus
} from "../controllers/salesApprovalController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply authentication to all sales approval routes
router.use(verifyToken);

router.post("/request", requestSalesApproval);
router.get("/", getSalesApprovals);
router.put("/:id", updateSalesApproval);
router.get("/status/:opportunityId", getApprovalStatus);

export default router;
