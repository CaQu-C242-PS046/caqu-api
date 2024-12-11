const sequelize = require('../db');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { generateAccessToken, generateRefreshToken } = require('./tokenController');
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const sendWelcomeEmail = async (email) => {
  const accessToken = await oAuth2Client.getAccessToken();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Selamat Datang di Aplikasi CaQu!',
    html: `
    <div style="font-family: cursive; line-height: 1.6; color: #333;">
      <h2 style="color: #32b6ba;">Selamat Datang di CaQu🎉</h2>
      <p>Terima kasih telah mendaftar. Kami senang Anda bergabung dengan komunitas kami!</p>
      <p >
        "Raih masa depan gemilang dengan percaya pada langkah Anda! Temukan jalur karier impian yang sesuai dengan passion, kembangkan potensi terbaik Anda, dan jadilah pribadi sukses yang mampu menginspirasi banyak orang. Masa depan cerah menanti, dan semuanya dimulai dari sini!"
      </p>
      <p>
        Jangan ragu untuk <a href="caquapp@gmail.com" style="color: #32b6ba;">menghubungi kami</a> jika ada pertanyaan.
      </p>
      <footer style="margin-top: 20px; font-size: 0.9em; color: #777;">
        © 2024 CaQu. Semua hak dilindungi.
      </footer>
    </div>
  `,
};

  await transporter.sendMail(mailOptions);
};


//REGISTER
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Semua field harus diisi.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Kata sandi harus memiliki minimal 8 karakter.' });
  }

  const transaction = await sequelize.transaction();

  try {
    const existingUser = await User.findOne({ where: { username }, transaction });
    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah digunakan, coba yang lain.' });
    }

    const existingEmail = await User.findOne({ where: { email }, transaction });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword }, { transaction });

    await sendWelcomeEmail(email);

    await transaction.commit();
    res.status(201).json({ message: 'Registrasi berhasil!' });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback(); 
    }
    console.error('Error saat registrasi:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};


//LOGIN
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({
        message: 'Username atau password salah.',
        success: false,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Username atau password salah.',
        success: false,
      });
    }

    const payload = { id: user.id_login, username: user.username };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.set('refresh_token', refreshToken);
    await user.save();

    res.status(200).json({
      message: 'Login berhasil',
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan pada server.',
      success: false,
    });
  }
};


//LOGOUT
const logoutUser = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).send('User tidak ditemukan.');

    user.refresh_token = null;
    await user.save();

    res.status(200).send('Logout berhasil.');
  } catch (error) {
    console.error('Error saat logout:', error);
    res.status(500).send('Terjadi kesalahan pada server.');
  }
};

//REFRESH TOKEN
const refreshToken = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) return res.sendStatus(401);

  try {
    const user = await User.findOne({ where: { refresh_token } });
    if (!user) return res.status(400).send('Token tidak valid'); 

    jwt.verify(refresh_token, REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(400); 

      const accessToken = generateAccessToken({ username: decoded.username });

      res.status(200).json({
        message: 'Token berhasil diperbarui',
        success: true,
        accessToken,
      });
    });
  } catch (error) {
    console.error('Error saat refresh token:', error);
    res.status(500).send('Terjadi kesalahan pada server.');
  }
};

//CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Diperlukan kata sandi lama dan kata sandi baru' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Kata sandi baru harus minimal 8 karakter' });
    }

    const user = await User.findOne({ where: { id_login: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password lama salah' });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'Kata sandi baru tidak boleh sama dengan kata sandi lama' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update({ password: hashedPassword }, { where: { id_login: userId } });

    res.status(200).json({ message: 'Password berhasil diubah' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.Terjadi kesalahan pada server.' });
  }
};

module.exports = { registerUser, loginUser, logoutUser, refreshToken, changePassword }
