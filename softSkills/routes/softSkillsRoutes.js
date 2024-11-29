const express = require('express');
const { getSoftSkillsByName, getAllSoftSkillNames} = require('../controllers/softSkillsControllers');
const authenticateToken = require('../../authentication/middleware/authMiddleware');
const router = express.Router();

router.get('/softSkills/all', getAllSoftSkillNames);
router.get('/softSkills/:name', getSoftSkillsByName);

module.exports = router;
