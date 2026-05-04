import CompOffRequest from '../../models/mongo/CompOffRequest.js';
import User from '../../models/mongo/User.js';

// @desc    Request Comp Off
// @route   POST /api/compoff/apply
// @access  Private
export const applyCompOff = async (req, res, next) => {
  try {
    const { dateWorked, reason } = req.body;

    if (!dateWorked) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Reason is required' });
    }

    const request = await CompOffRequest.create({
      userId: req.mongoUser._id,
      dateWorked,
      reason: reason.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Comp Off request submitted successfully',
      data: { request },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A request already exists for this date' });
    }
    next(error);
  }
};

// @desc    Get my comp off requests
// @route   GET /api/compoff/my
// @access  Private
export const getMyCompOffRequests = async (req, res, next) => {
  try {
    const requests = await CompOffRequest.find({ userId: req.mongoUser._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { requests },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all comp off requests (Admin)
// @route   GET /api/admin/compoff
// @access  Admin
export const getAllCompOffRequests = async (req, res, next) => {
  try {
    const requests = await CompOffRequest.find()
      .populate('userId', 'fullName email employeeId profilePicture')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { requests },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review Comp Off request (Admin) — increments paidLeaves on approval
// @route   PUT /api/admin/compoff/:id/review
// @access  Admin
export const reviewCompOffRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    const request = await CompOffRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'This request has already been reviewed' });
    }

    request.status = status;
    request.adminComment = adminComment || '';
    request.reviewedBy = req.mongoUser._id;
    request.reviewedAt = new Date();

    await request.save();

    // On approval — increment the employee's paid leaves by 1.
    // Use aggregation pipeline update so $ifNull handles users who don't have
    // paidLeaves in their DB document yet (defaults to 12, then adds 1).
    if (status === 'Approved') {
      await User.findByIdAndUpdate(
        request.userId,
        [{ $set: { paidLeaves: { $add: [{ $ifNull: ['$paidLeaves', 12] }, 1] } } }],
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: `Comp Off request ${status.toLowerCase()} successfully`,
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};
