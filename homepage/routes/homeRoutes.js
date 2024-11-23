const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const authenticateToken = require('../../authentication/middleware/authMiddleware');

router.get('/home', authenticateToken, homeController.getHomePage);

module.exports = router;
