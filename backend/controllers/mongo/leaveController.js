import Leave from '../../models/mongo/Leave.js';
import User from '../../models/mongo/User.js';
import CompOffRequest from '../../models/mongo/CompOffRequest.js';

// @desc    Get current employee's paid leave balance
// @route   GET /api/leave/balance
// @access  Private
export const getLeaveBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.mongoUser._id).select('paidLeaves');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // If paidLeaves is undefined (old record), default to 12
    const paidLeaves = user.paidLeaves ?? 12;
    res.status(200).json({ success: true, data: { paidLeaves } });
  } catch (error) {
    next(error);
  }
};


// @desc    Apply for leave
// @route   POST /api/leave/apply
// @access  Private
export const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;

    if (!leaveType || !fromDate || !toDate) {
      return res.status(400).json({ success: false, message: 'Leave type, from date, and to date are required' });
    }

    if (!['Planned', 'Sick', 'CompOff'].includes(leaveType)) {
      return res.status(400).json({ success: false, message: 'Leave type must be Planned, Sick, or CompOff' });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (to < from) {
      return res.status(400).json({ success: false, message: 'To date must be after from date' });
    }

    // Calculate total days (inclusive)
    const diffTime = Math.abs(to - from);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // CompOff specific checks
    if (leaveType === 'CompOff') {
      const availableCredits = await CompOffRequest.find({
        userId: req.mongoUser._id,
        status: 'Approved',
        isUsed: false,
        expiryDate: { $gt: new Date() }
      });

      if (availableCredits.length < totalDays) {
        return res.status(400).json({
          success: false,
          message: `Insufficient Comp Off credits. Available: ${availableCredits.length}, Requested: ${totalDays}`
        });
      }

      // Mark credits as used (we'll do this after leave is approved, or maybe now?)
      // Actually, standard practice is to mark them as "Pending Usage" or similar.
      // But for simplicity, let's just create the leave. 
      // We should probably link the credits to the leave application.
    }

    // Planned leave must be at least 14 days in advance
    if (leaveType === 'Planned') {
      const now = new Date();
      const minDate = new Date(now);
      minDate.setDate(minDate.getDate() + 14);
      minDate.setHours(0, 0, 0, 0);

      if (from < minDate) {
        return res.status(400).json({
          success: false,
          message: 'Planned leave must be applied at least 2 weeks (14 days) in advance',
        });
      }
    }

    const leave = await Leave.create({
      userId: req.mongoUser._id,
      leaveType,
      fromDate,
      toDate,
      totalDays,
      reason: reason || '',
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: { leave },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my leave applications
// @route   GET /api/leave/my
// @access  Private
export const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ userId: req.mongoUser._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { leaves },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leave applications (Admin)
// @route   GET /api/admin/leaves
// @access  Admin
export const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find()
      .populate('userId', 'fullName email employeeId profilePicture')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { leaves },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject leave (Admin)
// @route   PUT /api/admin/leave/:id/review
// @access  Admin
export const reviewLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave application not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'This leave has already been reviewed' });
    }

    leave.status = status;
    leave.adminComment = adminComment || '';
    leave.reviewedBy = req.mongoUser._id;
    leave.reviewedAt = new Date();
    await leave.save();

    // If CompOff leave is approved, mark the credits as used
    if (status === 'Approved' && leave.leaveType === 'CompOff') {
      const credits = await CompOffRequest.find({
        userId: leave.userId,
        status: 'Approved',
        isUsed: false,
        expiryDate: { $gt: new Date() }
      }).sort({ expiryDate: 1 }).limit(leave.totalDays);

      for (const credit of credits) {
        credit.isUsed = true;
        credit.usedOnLeaveId = leave._id;
        await credit.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Leave ${status.toLowerCase()} successfully`,
      data: { leave },
    });
  } catch (error) {
    next(error);
  }
};
