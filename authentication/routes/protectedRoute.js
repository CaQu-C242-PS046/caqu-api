const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const User = require('../models/User');

router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is protected data', user: req.user });
});

// New email validation route
router.get('/validate-email', async (req, res) => {
  const { token } = req.query;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // Find the user based on the email in the token
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update the user's validation status
    user.isValidated = true; // Assuming `isValidated` exists in the User schema
    await user.save();

    res.json({ message: 'Email successfully validated!' });
  } catch (error) {
    console.error('Error validating email:', error);
    res.status(400).json({ error: 'Invalid or expired token.' });
  }
});

module.exports = router;
