import Holiday from '../../models/mongo/Holiday.js';

// @desc    Create a new holiday
// @route   POST /api/admin/holidays
// @access  Admin
export const createHoliday = async (req, res, next) => {
  try {
    const { title, date, type, location, department, description } = req.body;

    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Title and date are required' });
    }

    const holiday = await Holiday.create({
      title,
      date,
      type: type || 'National',
      location: location || 'All',
      department: department || 'All',
      description: description || '',
      createdBy: req.mongoUser._id,
    });

    res.status(201).json({
      success: true,
      message: 'Holiday created successfully',
      data: { holiday },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all holidays
// @route   GET /api/holidays
// @access  Private
export const getHolidays = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    let query = {};

    if (year) {
      if (month) {
        // Filter by year and month (YYYY-MM)
        const monthStr = month.toString().padStart(2, '0');
        query.date = { $regex: `^${year}-${monthStr}` };
      } else {
        // Filter by year (YYYY)
        query.date = { $regex: `^${year}` };
      }
    }

    const holidays = await Holiday.find(query).sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: { holidays },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a holiday
// @route   PUT /api/admin/holidays/:id
// @access  Admin
export const updateHoliday = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const holiday = await Holiday.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Holiday updated successfully',
      data: { holiday },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a holiday
// @route   DELETE /api/admin/holidays/:id
// @access  Admin
export const deleteHoliday = async (req, res, next) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findByIdAndDelete(id);

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Holiday deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
