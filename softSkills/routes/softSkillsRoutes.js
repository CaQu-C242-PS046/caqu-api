const express = require('express');
const { getSoftSkillsById, getAllSoftSkillNames} = require('../controllers/softSkillsControllers');
const authenticateToken = require('../../authentication/middleware/authMiddleware');
const router = express.Router();

router.get('/softSkills/names', authenticateToken, getAllSoftSkillNames);
router.get('/softSkills/:id', authenticateToken, getSoftSkillsById);

module.exports = router;
