const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');

// mengirimkan email verifikasi reset password
const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).send({ message: 'Email tidak ditemukan' });

    const resetToken = crypto.randomBytes(20).toString('hex');

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password',
      text: `Klik link berikut untuk mereset password Anda: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send({ message: 'Tautan reset password telah dikirim ke email Anda.' });
  } catch (error) {
    res.status(500).send({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

// Menangani reset password
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const currentTime = Date.now();
    const tokenExpiryTime = Date.now() - 3600000;

    if (currentTime < tokenExpiryTime) {
      return res.status(400).send({ message: 'Token sudah kedaluwarsa.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).send({ message: 'Email tidak ditemukan' });

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword   ;

    await user.save();

    res.status(200).send({ message: 'Password berhasil diubah.' });
  } catch (error) {
    res.status(500).send({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};




module.exports = { sendPasswordResetEmail, resetPassword };
