const express = require('express');
const { registerUser, loginUser, refreshToken, logoutUser, changePassword, googleLogin, verifyEmail} = require('../controllers/authController');
// const verifyGoogleToken = require('../controllers/tokenController');
const authenticateToken = require('../../authentication/middleware/authMiddleware');
// const proxyController = require('../../authentication/controllers/proxyController')
const router = express.Router();

router.post('/register', registerUser); 
router.post('/login', loginUser); 
router.post('/refresh', refreshToken); 
router.post('/logout', logoutUser);
router.post('/change', authenticateToken, changePassword);
router.get('/verify-email', verifyEmail)
// router.post('/proxy-message', proxyController.handleProxyRequest)
router.post('/googleLogin', googleLogin);
// router.post('/verify-id-token', verifyGoogleToken);


module.exports = router;
