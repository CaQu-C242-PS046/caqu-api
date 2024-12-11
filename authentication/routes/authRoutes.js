const express = require('express');
const { registerUser, loginUser, refreshToken, logoutUser, changePassword } = require('../controllers/authController');
const authenticateToken = require('../../authentication/middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser); 
router.post('/login', loginUser); 
router.post('/refresh', refreshToken); 
router.post('/logout', logoutUser);
router.post('/change', authenticateToken, changePassword);

module.exports = router; 
