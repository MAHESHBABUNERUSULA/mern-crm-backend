const express = require('express');
const { getActivityLogs } = require('../controllers/activityLogController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getActivityLogs);

module.exports = router;
