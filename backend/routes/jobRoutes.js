const express = require('express');
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyJob,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(getJobs).post(protect, createJob);
router.route('/:id').get(getJobById).put(protect, updateJob).delete(protect, deleteJob);
router.route('/:id/apply').post(protect, applyJob);

module.exports = router;
