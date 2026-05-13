const path = require('path');
const fs = require('fs');
const http = require('http');
const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');

const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate('postedBy', 'name email role photo companySize industry').sort({ createdAt: -1 });
  res.json(jobs);
});

const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
  res.json(jobs);
});

const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('postedBy', 'name email role photo companySize industry');
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
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.applicants.some((id) => id.toString() === req.user._id.toString())) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400);
    throw new Error('Already applied to this job');
  }

  await Application.create({
    job: job._id,
    applicant: req.user._id,
    cvOriginalName: req.file?.originalname || null,
    cvPath: req.file?.path || null,
    coverLetter: req.body.coverLetter || '',
  });

  job.applicants.push(req.user._id);
  await job.save();
  res.json({ message: 'Application submitted' });
});

// ── AI scoring helper (calls Python Flask service on port 5001) ───────────────
function callAIService(jdText, applications) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      job_description: jdText,
      applications: applications.map((a) => ({
        id: a._id.toString(),
        cv_path: a.cvPath || null,
      })),
    });

    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/score-cvs',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(null); }
      });
    });

    req.on('error', () => resolve(null));
    req.setTimeout(120000, () => { req.destroy(); resolve(null); });
    req.write(payload);
    req.end();
  });
}

const getJobApplicants = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  if (job.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  let applications = await Application.find({ job: req.params.id })
    .populate('applicant', 'firstName lastName email skills experience bio location')
    .lean();

  // Score any applications that haven't been scored yet
  const unscored = applications.filter((a) => a.aiScore === null || a.aiScore === undefined);

  if (unscored.length > 0) {
    const jdText = [job.title, job.category, job.description, ...(job.requirements || [])]
      .filter(Boolean)
      .join(' ');

    const scores = await callAIService(jdText, unscored);

    if (scores && Array.isArray(scores)) {
      await Promise.all(
        scores.map((s) =>
          Application.findByIdAndUpdate(s.id, {
            aiScore: s.score,
            aiBreakdown: s.breakdown,
          })
        )
      );

      // Merge scores into the in-memory results
      const scoreMap = Object.fromEntries(scores.map((s) => [s.id, s]));
      applications = applications.map((a) => {
        const s = scoreMap[a._id.toString()];
        return s ? { ...a, aiScore: s.score, aiBreakdown: s.breakdown } : a;
      });
    }
  }

  // Sort: scored apps descending by score, unscored at the end
  applications.sort((a, b) => {
    if (a.aiScore == null && b.aiScore == null) return 0;
    if (a.aiScore == null) return 1;
    if (b.aiScore == null) return -1;
    return b.aiScore - a.aiScore;
  });

  res.json(applications);
});

const unapplyJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  job.applicants = job.applicants.filter(
    (id) => id.toString() !== req.user._id.toString()
  );
  await job.save();

  const application = await Application.findOneAndDelete({
    job: req.params.id,
    applicant: req.user._id,
  });
  if (application?.cvPath && fs.existsSync(application.cvPath)) {
    fs.unlinkSync(application.cvPath);
  }

  res.json({ message: 'Application withdrawn' });
});

const getAppliedJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ applicants: req.user._id })
    .populate('postedBy', 'name email companyName photo companySize industry')
    .sort({ createdAt: -1 });

  const applications = await Application.find({
    applicant: req.user._id,
    job: { $in: jobs.map((j) => j._id) },
  }).select('job createdAt status');

  const appMap = {};
  applications.forEach((a) => {
    appMap[a.job.toString()] = { appliedAt: a.createdAt, status: a.status, applicationId: a._id };
  });

  const result = jobs.map((j) => ({
    ...j.toObject(),
    appliedAt: appMap[j._id.toString()]?.appliedAt || null,
    applicationStatus: appMap[j._id.toString()]?.status || 'applied',
    applicationId: appMap[j._id.toString()]?.applicationId || null,
  }));

  res.json(result);
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
    populate: { path: 'postedBy', select: 'companyName photo companySize industry' },
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
  unapplyJob,
  getAppliedJobs,
  getJobApplicants,
  toggleSaveJob,
  getSavedJobs,
};
