const express = require('express');
const { getKarirByName } = require('../controllers/careerControllers');
const authenticateToken = require('../../authentication/middleware/authMiddleware');
const router = express.Router();

router.get('/career/:name',authenticateToken, getKarirByName);


module.exports = router;

