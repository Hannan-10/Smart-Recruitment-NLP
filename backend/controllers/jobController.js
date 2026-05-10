const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const User = require('../models/User');

const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate('postedBy', 'name email role');
  res.json(jobs);
});

const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
  res.json(jobs);
});

const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('postedBy', 'name email role');
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  res.json(job);
});

const createJob = asyncHandler(async (req, res) => {
  const { title, company, location, salary, type, category, description, requirements } = req.body;

  if (!title || !company || !location || !description) {
    res.status(400);
    throw new Error('Title, company, location, and description are required');
  }

  const job = await Job.create({
    title,
    company,
    location,
    salary,
    type: type || 'full-time',
    category,
    description,
    requirements: Array.isArray(requirements) ? requirements : [],
    postedBy: req.user._id,
  });

  res.status(201).json(job);
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this job');
  }

  const { title, company, location, salary, type, category, description, requirements } = req.body;
  if (title !== undefined) job.title = title;
  if (company !== undefined) job.company = company;
  if (location !== undefined) job.location = location;
  if (salary !== undefined) job.salary = salary;
  if (type !== undefined) job.type = type;
  if (category !== undefined) job.category = category;
  if (description !== undefined) job.description = description;
  if (requirements !== undefined) job.requirements = requirements;

  const updatedJob = await job.save();
  res.json(updatedJob);
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this job');
  }

  await Job.findByIdAndDelete(req.params.id);
  res.json({ message: 'Job removed' });
});

const applyJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.applicants.includes(req.user._id)) {
    res.status(400);
    throw new Error('Already applied to this job');
  }

  job.applicants.push(req.user._id);
  await job.save();
  res.json({ message: 'Application submitted' });
});

const toggleSaveJob = asyncHandler(async (req, res) => {
  const jobId = req.params.id;
  const userId = req.user._id;

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  const user = await User.findById(userId);
  const alreadySaved = user.savedJobs.some((id) => id.toString() === jobId.toString());

  if (alreadySaved) {
    user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId.toString());
    await user.save();
    res.json({ saved: false, message: 'Job removed from saved' });
  } else {
    user.savedJobs.push(jobId);
    await user.save();
    res.json({ saved: true, message: 'Job saved' });
  }
});

const getSavedJobs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedJobs',
    populate: { path: 'postedBy', select: 'companyName' },
  });
  res.json(user.savedJobs);
});

module.exports = {
  getJobs,
  getMyJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyJob,
  toggleSaveJob,
  getSavedJobs,
};
