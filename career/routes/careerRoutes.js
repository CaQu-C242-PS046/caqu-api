const express = require('express');
const { getKarirById } = require('../controllers/careerControllers');
const authenticateToken = require('../../authentication/middleware/authMiddleware');
const router = express.Router();

router.get('/career/:id', authenticateToken, getKarirById);


module.exports = router;

