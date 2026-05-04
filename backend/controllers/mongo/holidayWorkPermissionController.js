import HolidayWorkPermission from '../../models/mongo/HolidayWorkPermission.js';
import Holiday from '../../models/mongo/Holiday.js';

// @desc    Request permission to work on a holiday
// @route   POST /api/holiday-permission/apply
// @access  Private
export const applyHolidayPermission = async (req, res, next) => {
  try {
    const { holidayDate, reason } = req.body;

    if (!holidayDate || !reason) {
      return res.status(400).json({ success: false, message: 'Holiday date and reason are required' });
    }

    // Check if the date is actually a holiday or weekend
    const date = new Date(holidayDate);
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;

    const isHoliday = await Holiday.findOne({ date: holidayDate });

    if (!isWeekend && !isHoliday) {
      return res.status(400).json({
        success: false,
        message: 'Permission is only required for work on weekends or holidays.',
      });
    }

    const permission = await HolidayWorkPermission.create({
      userId: req.mongoUser._id,
      holidayDate,
      reason,
    });

    res.status(201).json({
      success: true,
      message: 'Holiday work permission request submitted successfully',
      data: { permission },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Permission request already exists for this date' });
    }
    next(error);
  }
};

// @desc    Get my holiday work permission requests
// @route   GET /api/holiday-permission/my
// @access  Private
export const getMyHolidayPermissions = async (req, res, next) => {
  try {
    const permissions = await HolidayWorkPermission.find({ userId: req.mongoUser._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { permissions },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all holiday work permission requests (Admin)
// @route   GET /api/admin/holiday-permission
// @access  Admin
export const getAllHolidayPermissions = async (req, res, next) => {
  try {
    const permissions = await HolidayWorkPermission.find()
      .populate('userId', 'fullName email employeeId profilePicture')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { permissions },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review Holiday Work Permission request (Admin)
// @route   PUT /api/admin/holiday-permission/:id/review
// @access  Admin
export const reviewHolidayPermission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    const permission = await HolidayWorkPermission.findById(id);
    if (!permission) {
      return res.status(404).json({ success: false, message: 'Permission request not found' });
    }

    if (permission.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'This request has already been reviewed' });
    }

    permission.status = status;
    permission.adminComment = adminComment || '';
    permission.reviewedBy = req.mongoUser._id;
    permission.reviewedAt = new Date();
    await permission.save();

    res.status(200).json({
      success: true,
      message: `Permission request ${status.toLowerCase()} successfully`,
      data: { permission },
    });
  } catch (error) {
    next(error);
  }
};
