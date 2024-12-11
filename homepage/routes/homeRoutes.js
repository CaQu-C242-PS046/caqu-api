const express = require('express');
const router = express.Router();
const { getHomePage, getUserRecommendationHistory }= require('../controllers/homeController');
const authenticateToken = require('../../authentication/middleware/authMiddleware');

router.get('/home', authenticateToken, getHomePage);
router.get('/history',authenticateToken, getUserRecommendationHistory);

module.exports = router;
