const express = require('express');
const {
  registerUser,
  authUser,
  verifyOTP,
  refreshAccessToken,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  changePassword,
  deleteAccount,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/signup', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/signin', authUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, changePassword);
router.delete('/account', protect, deleteAccount);

module.exports = router;
