const express = require('express');
const { downloadCV, updateStatus } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/:id/cv', protect, downloadCV);
router.patch('/:id/status', protect, updateStatus);

module.exports = router;
