import express from "express";
import { 
  requestAccess, 
  getApprovals, 
  updateApprovalStatus,
  deleteApproval,
  getMyApprovals,
  grantAccess
} from "../controllers/approvalController.js";

const router = express.Router();

router.post("/request", requestAccess);
router.post("/grant", grantAccess);
router.get("/", getApprovals);
router.put("/:id", updateApprovalStatus);
router.delete("/:id", deleteApproval);
router.get("/my/:userId", getMyApprovals);

export default router;
