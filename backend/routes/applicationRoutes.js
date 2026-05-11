const express = require('express');
const { downloadCV } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/:id/cv', protect, downloadCV);

module.exports = router;
