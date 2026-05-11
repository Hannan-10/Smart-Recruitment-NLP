const express = require('express');
const {
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
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const router = express.Router();

router.route('/').get(getJobs).post(protect, createJob);
router.get('/my', protect, getMyJobs);
router.get('/saved', protect, getSavedJobs);
router.get('/applied', protect, getAppliedJobs);
router.route('/:id').get(getJobById).put(protect, updateJob).delete(protect, deleteJob);
router.post('/:id/save', protect, toggleSaveJob);
router.post('/:id/apply', protect, upload.single('cv'), applyJob);
router.delete('/:id/apply', protect, unapplyJob);
router.get('/:id/applicants', protect, getJobApplicants);

module.exports = router;
