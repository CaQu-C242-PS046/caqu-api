const express = require('express');
const multer = require('multer');
const { uploadProfilePicture, getProfilePicture } = require('../controllers/profileController');
const upload = multer({ storage: multer.memoryStorage() });
const authenticateToken = require('../../authentication/middleware/authMiddleware');

const router = express.Router();

router.post('/upload-profile', upload.single('profilePicture'), authenticateToken, uploadProfilePicture);

router.get('/profile-picture/:userId', authenticateToken, getProfilePicture);

module.exports = router;
