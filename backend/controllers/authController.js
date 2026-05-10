const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTP = require('../models/OTP');

// Initialize transporter only if email credentials are available
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  console.warn('Email credentials not configured. OTP emails will not be sent.');
}

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateAccessToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'default_recruitment_secret',
    {
      expiresIn: '1h',
    }
  );
};

const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret',
    {
      expiresIn: '24h',
    }
  );
};

const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, role } = req.body;

  if (!firstName || !lastName || !email || !password || !confirmPassword || !role) {
    res.status(400);
    throw new Error('All fields are required');
  }

  if (!validateEmail(email)) {
    res.status(400);
    throw new Error('Invalid email format');
  }

  if (!validatePassword(password)) {
    res.status(400);
    throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Generate OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save OTP
  await OTP.create({ email, otp, expiresAt, type: 'signup' });

  // Send OTP email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Smart Recruitment',
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
  };

  console.log(`OTP for ${email}: ${otp}`); // For testing

  // Send email if configured
  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error('Error sending email:', err);
      // Don't fail the request if email fails, user can try to sign up again
      res.status(200).json({
        message: 'OTP created (email delivery may have failed)',
        email,
        warning: 'Check console for OTP during testing',
      });
      return;
    }
  } else {
    console.warn('Email not configured - OTP will be logged to console only');
  }

  res.status(200).json({
    message: 'OTP sent to your email',
    email,
  });
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp, firstName, lastName, password, role } = req.body;

  if (!email || !otp || !firstName || !lastName || !password || !role) {
    res.status(400);
    throw new Error('All fields are required');
  }

  const otpRecord = await OTP.findOne({ email, otp, type: 'signup' });

  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  // Delete the OTP
  await OTP.deleteOne({ _id: otpRecord._id });

  // Create the user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role,
    isVerified: true,
  });

  if (user) {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400);
    throw new Error('Refresh token is required');
  }

  const decoded = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret'
  );

  const user = await User.findById(decoded.id);

  if (!user || user.refreshToken !== refreshToken) {
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save();

  res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !validateEmail(email)) {
    res.status(400);
    throw new Error('Valid email is required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(200).json({ message: 'If this email is registered, an OTP will be sent.' });
    return;
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OTP.deleteMany({ email, type: 'reset' });
  await OTP.create({ email, otp, expiresAt, type: 'reset' });

  console.log(`Password reset OTP for ${email}: ${otp}`);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset OTP – Smart Recruitment',
        text: `Your OTP for password reset is ${otp}. It expires in 10 minutes.`,
      });
    } catch (err) {
      console.error('Error sending reset email:', err);
    }
  }

  res.status(200).json({ message: 'If this email is registered, an OTP will be sent.' });
});

const verifyResetOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error('Email and OTP are required');
  }

  const otpRecord = await OTP.findOne({ email, otp, type: 'reset' });

  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  await OTP.deleteOne({ _id: otpRecord._id });

  const resetToken = jwt.sign(
    { email, purpose: 'password-reset' },
    process.env.JWT_SECRET || 'default_recruitment_secret',
    { expiresIn: '15m' }
  );

  res.status(200).json({ resetToken });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword, confirmPassword } = req.body;

  if (!resetToken || !newPassword || !confirmPassword) {
    res.status(400);
    throw new Error('All fields are required');
  }

  if (newPassword !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  if (!validatePassword(newPassword)) {
    res.status(400);
    throw new Error('Password must be at least 8 characters with uppercase, lowercase, and a number');
  }

  let decoded;
  try {
    decoded = jwt.verify(
      resetToken,
      process.env.JWT_SECRET || 'default_recruitment_secret'
    );
  } catch {
    res.status(400);
    throw new Error('Invalid or expired reset token. Please request a new OTP.');
  }

  if (decoded.purpose !== 'password-reset') {
    res.status(400);
    throw new Error('Invalid reset token');
  }

  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: 'Password reset successfully' });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword || !confirmPassword) {
    res.status(400);
    throw new Error('All fields are required');
  }

  if (newPassword !== confirmPassword) {
    res.status(400);
    throw new Error('New passwords do not match');
  }

  if (!validatePassword(newPassword)) {
    res.status(400);
    throw new Error('Password must be at least 8 characters with uppercase, lowercase, and a number');
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: 'Password updated successfully' });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const userId = req.user.id;

  if (!password) {
    res.status(400);
    throw new Error('Password is required to delete your account');
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(400);
    throw new Error('Incorrect password');
  }

  await User.findByIdAndDelete(userId);

  res.status(200).json({ message: 'Account deleted successfully' });
});

module.exports = {
  registerUser,
  authUser,
  verifyOTP,
  refreshAccessToken,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  changePassword,
  deleteAccount,
};
