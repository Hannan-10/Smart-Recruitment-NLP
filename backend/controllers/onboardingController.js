const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const updateApplicantProfile = asyncHandler(async (req, res) => {
  const { bio, experience, skills, location } = req.body;
  const userId = req.user.id;

  if (!bio || !experience || !skills || !location) {
    res.status(400);
    throw new Error('All fields are required');
  }

  if (!Array.isArray(skills) || skills.length === 0) {
    res.status(400);
    throw new Error('At least one skill is required');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      bio,
      skills,
      location,
      experience,
    },
    { new: true }
  );

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    message: 'Applicant profile updated successfully',
    user,
  });
});

const updateRecruiterProfile = asyncHandler(async (req, res) => {
  const { companyName, companySize, industry, location } = req.body;
  const userId = req.user.id;

  if (!companyName || !companySize || !industry || !location) {
    res.status(400);
    throw new Error('All fields are required');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      companyName,
      companySize,
      industry,
      location,
    },
    { new: true }
  );

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    message: 'Recruiter profile updated successfully',
    user,
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json(user);
});

const editApplicantProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, bio, experience, skills, location } = req.body;
  const userId = req.user.id;

  const updateData = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (bio !== undefined) updateData.bio = bio;
  if (experience !== undefined) updateData.experience = experience;
  if (location !== undefined) updateData.location = location;
  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      res.status(400);
      throw new Error('Skills must be an array');
    }
    updateData.skills = skills;
  }

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({ message: 'Profile updated successfully', user });
});

const editRecruiterProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, companyName, companySize, industry, location } = req.body;
  const userId = req.user.id;

  const updateData = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (companyName !== undefined) updateData.companyName = companyName;
  if (companySize !== undefined) updateData.companySize = companySize;
  if (industry !== undefined) updateData.industry = industry;
  if (location !== undefined) updateData.location = location;

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({ message: 'Profile updated successfully', user });
});

module.exports = {
  updateApplicantProfile,
  updateRecruiterProfile,
  getProfile,
  editApplicantProfile,
  editRecruiterProfile,
};
