const express = require('express');
const {
  getJobs,
  getMyJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyJob,
  toggleSaveJob,
  getSavedJobs,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(getJobs).post(protect, createJob);
router.get('/my', protect, getMyJobs);
router.get('/saved', protect, getSavedJobs);
router.route('/:id').get(getJobById).put(protect, updateJob).delete(protect, deleteJob);
router.post('/:id/save', protect, toggleSaveJob);
router.post('/:id/apply', protect, applyJob);

module.exports = router;
