const asyncHandler = require('express-async-handler');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs for logged-in user (paginated)
// @route   GET /api/activity-logs?page=1&limit=10
// @access  Private
const getActivityLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const result = await ActivityLog.paginate(
    { user: req.user._id },
    { page, limit, sort: { createdAt: -1 } }
  );

  res.status(200).json({
    success: true,
    data: result.docs,
    pagination: {
      total: result.totalDocs,
      page: result.page,
      pages: result.totalPages,
      limit: result.limit,
    },
  });
});

module.exports = { getActivityLogs };
