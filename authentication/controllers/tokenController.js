const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new OAuth2Client(CLIENT_ID);
async function verifyIdToken(idToken) {
  try {
      const ticket = await client.verifyIdToken({
          idToken,
          audience: CLIENT_ID,
      });
      return ticket.getPayload();
  } catch (error) {
      throw new Error('Invalid Google token');
  }
}

function generateAccessToken(user) {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
}

function generateRefreshToken(user) {
  return jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
}

module.exports = { generateAccessToken, generateRefreshToken, 
verifyIdToken
};
