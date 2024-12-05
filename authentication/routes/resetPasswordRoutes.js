const express = require('express');
const router = express.Router();
const { sendPasswordResetEmail, resetPassword } = require('../controllers/resetPasswordController');

router.post('/forgot-password', sendPasswordResetEmail);

router.put('/reset-password', resetPassword);
module.exports = router;
