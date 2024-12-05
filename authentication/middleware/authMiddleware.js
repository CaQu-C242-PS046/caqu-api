// const jwt = require('jsonwebtoken');
// const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) return res.sendStatus(401);

//   jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// };

// module.exports = authenticateToken;

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    // Verify the token
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    // Fetch user from the database using the decoded information
    const user = await User.findOne({ where: { id_login: decoded.id_login } });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if the user's email is validated
    if (!user.isValidated) {
      return res.status(403).json({ error: 'Email not validated. Please validate your email to access this resource.' });
    }

    // Attach the user to the request object for further use
    req.user = user;
    next();
  } catch (err) {
    console.error('Error in authentication middleware:', err);
    res.status(403).json({ error: 'Invalid token or session expired.' });
  }
};

module.exports = authenticateToken;

