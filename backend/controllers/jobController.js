const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');

const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate('postedBy', 'name email role');
  res.json(jobs);
});

const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate(
    'postedBy',
    'name email role'
  );

  if (job) {
    res.json(job);
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

const createJob = asyncHandler(async (req, res) => {
  const { title, company, location, salary, type, category, description, requirements } = req.body;

  const job = new Job({
    title,
    company,
    location,
    salary,
    type,
    category,
    description,
    requirements,
    postedBy: req.user._id,
  });

  const createdJob = await job.save();
  res.status(201).json(createdJob);
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (job) {
    job.title = req.body.title || job.title;
    job.company = req.body.company || job.company;
    job.location = req.body.location || job.location;
    job.salary = req.body.salary || job.salary;
    job.type = req.body.type || job.type;
    job.category = req.body.category || job.category;
    job.description = req.body.description || job.description;
    job.requirements = req.body.requirements || job.requirements;

    const updatedJob = await job.save();
    res.json(updatedJob);
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (job) {
    await job.remove();
    res.json({ message: 'Job removed' });
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

const applyJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (job) {
    if (job.applicants.includes(req.user._id)) {
      res.status(400);
      throw new Error('Already applied to this job');
    }

    job.applicants.push(req.user._id);
    await job.save();
    res.json({ message: 'Application submitted' });
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyJob,
};
