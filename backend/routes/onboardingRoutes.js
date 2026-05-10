const jwt = require('jsonwebtoken');
const express = require('express');
const {
  updateApplicantProfile,
  updateRecruiterProfile,
  getProfile,
  editApplicantProfile,
  editRecruiterProfile,
} = require('../controllers/onboardingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.post('/applicant', protect, updateApplicantProfile);
router.post('/recruiter', protect, updateRecruiterProfile);
router.put('/applicant', protect, editApplicantProfile);
router.put('/recruiter', protect, editRecruiterProfile);

module.exports = router;
