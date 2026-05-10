const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cvOriginalName: {
      type: String,
    },
    cvPath: {
      type: String,
    },
    coverLetter: {
      type: String,
      default: '',
    },
    aiScore: {
      type: Number,
      default: null,
    },
    aiBreakdown: {
      semantic:    { type: Number },
      skill_match: { type: Number },
      experience:  { type: Number },
    },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
