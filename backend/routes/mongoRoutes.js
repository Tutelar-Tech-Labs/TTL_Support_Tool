import express from 'express';
import {
  markPresent,
  getAttendance,
  getAttendanceByRange,
  createWorklog,
  getWorklogsByDate,
  getWorklogsByRange,
  updateProfile,
} from '../controllers/mongo/attendanceController.js';
import {
  getAllEmployees,
  getEmployeeById,
  getEmployeeWorklogs,
  getEmployeeAttendance,
  exportEmployeeCSV,
  exportGlobalAttendanceCSV,
  getDashboardStats,
} from '../controllers/mongo/adminController.js';
import {
  punchIn,
  punchOut,
  getTodayPunch,
  getWeeklySummary,
} from '../controllers/mongo/punchController.js';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  getLeaveBalance,
} from '../controllers/mongo/leaveController.js';
import {
  applyRegularization,
  getMyRegularizations,
  getAllRegularizations,
  reviewRegularization,
} from '../controllers/mongo/regularizationController.js';
import {
  createHoliday,
  getHolidays,
  updateHoliday,
  deleteHoliday,
} from '../controllers/mongo/holidayController.js';
import {
  applyCompOff,
  getMyCompOffRequests,
  getAllCompOffRequests,
  reviewCompOffRequest,
} from '../controllers/mongo/compOffController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { syncMongoUser } from '../middlewares/mongoSync.js';

const router = express.Router();

// Apply Auth & Sync globally for these routes
router.use(verifyToken);
router.use(syncMongoUser);

// --- Employee Routes ---
router.post('/attendance/mark-present', markPresent);
router.get('/attendance/range', getAttendanceByRange);
router.get('/attendance', getAttendance);
router.post('/worklogs', createWorklog);
router.get('/worklogs', getWorklogsByDate);
router.get('/worklogs/range', getWorklogsByRange);
router.put('/attendance/profile', updateProfile);

// --- Punch Clock Routes ---
router.post('/punch/in', punchIn);
router.post('/punch/out', punchOut);
router.get('/punch/today', getTodayPunch);
router.get('/punch/weekly', getWeeklySummary);

// --- Leave Routes (Employee) ---
router.post('/leave/apply', applyLeave);
router.get('/leave/my', getMyLeaves);
router.get('/leave/balance', getLeaveBalance);

// --- Regularization Routes (Employee) ---
router.post('/regularization/apply', applyRegularization);
router.get('/regularization/my', getMyRegularizations);

// --- Holiday Routes (Public/Employee) ---
router.get('/holidays', getHolidays);

// --- Comp Off Routes (Employee) ---
router.post('/compoff/apply', applyCompOff);
router.get('/compoff/my', getMyCompOffRequests);

// --- Admin Routes ---
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

router.get('/admin/employees', requireAdmin, getAllEmployees);
router.get('/admin/employees/:id', requireAdmin, getEmployeeById);
router.get('/admin/employees/:id/worklogs', requireAdmin, getEmployeeWorklogs);
router.get('/admin/employees/:id/attendance', requireAdmin, getEmployeeAttendance);
router.get('/admin/employees/:id/export/csv', requireAdmin, exportEmployeeCSV);
router.get('/admin/attendance/export', requireAdmin, exportGlobalAttendanceCSV);
router.get('/admin/stats', requireAdmin, getDashboardStats);

// --- Leave Routes (Admin) ---
router.get('/admin/leaves', requireAdmin, getAllLeaves);
router.put('/admin/leave/:id/review', requireAdmin, reviewLeave);

// --- Regularization Routes (Admin) ---
router.get('/admin/regularizations', requireAdmin, getAllRegularizations);
router.put('/admin/regularization/:id/review', requireAdmin, reviewRegularization);

// --- Holiday Routes (Admin) ---
router.post('/admin/holidays', requireAdmin, createHoliday);
router.put('/admin/holidays/:id', requireAdmin, updateHoliday);
router.delete('/admin/holidays/:id', requireAdmin, deleteHoliday);

// --- Comp Off Routes (Admin) ---
router.get('/admin/compoff', requireAdmin, getAllCompOffRequests);
router.put('/admin/compoff/:id/review', requireAdmin, reviewCompOffRequest);

export default router;
