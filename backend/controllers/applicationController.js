const path = require('path');
const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const Job = require('../models/Job');

const downloadCV = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate('job', 'postedBy');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (application.job.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (!application.cvPath) {
    res.status(404);
    throw new Error('No CV on file for this application');
  }

  const absolutePath = path.resolve(application.cvPath);
  res.download(absolutePath, application.cvOriginalName || 'cv');
});

module.exports = { downloadCV };
