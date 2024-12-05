// const bcrypt = require('bcrypt');
// const User = require('../models/User');
// const nodemailer = require('nodemailer');
// const { google } = require('googleapis');
// const jwt = require('jsonwebtoken');

// const oAuth2Client = new google.auth.OAuth2(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET,
//   process.env.REDIRECT_URI
// );
// oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });


// const sendPasswordResetEmail = async (req, res) => {
//   const { email } = req.body;

//   try {
//     // Buat token JWT
//     const resetToken = jwt.sign(
//       { email }, // Payload hanya email
//       process.env.REFRESH_TOKEN_SECRET, // Secret key
//       { expiresIn: '15m' } // Token berlaku 15 menit
//     );

//     // Link reset password
//     const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

//     // Kirim email
//     const accessToken = await oAuth2Client.getAccessToken();
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         type: 'OAuth2',
//         user: process.env.EMAIL_USER,
//         clientId: process.env.CLIENT_ID,
//         clientSecret: process.env.CLIENT_SECRET,
//         refreshToken: process.env.REFRESH_TOKEN,
//         accessToken: accessToken.token,
//       },
//     });

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Reset Password',
//       text: `Klik tautan berikut untuk mereset password Anda: ${resetLink}\n\nLink ini hanya berlaku selama 15 menit.`,
//     };

//     await transporter.sendMail(mailOptions);

//     // Respons selalu sukses tanpa mengungkap apakah email terdaftar atau tidak
//     res.status(200).json({
//       success: true,
//       message: 'Jika email terdaftar, tautan reset password telah dikirim.',
//     });
//   } catch (error) {
//     console.error('Error sending reset password email:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Terjadi kesalahan pada server.',
//     });
//   }
// };




// const resetPassword = async (req, res) => {
//   const { resetToken, newPassword } = req.body;

//   try {
//     // Verifikasi token
//     const decoded = jwt.verify(resetToken, process.env.REFRESH_TOKEN_SECRET);

//     // Cari pengguna berdasarkan email dari token
//     const user = await User.findOne({ where: { email: decoded.email } });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'Pengguna tidak ditemukan.',
//       });
//     }

//     // Hash password baru
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // Update password pengguna
//     user.password = hashedPassword;
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: 'Password berhasil diubah.',
//     });
//   } catch (error) {
//     if (error.name === 'TokenExpiredError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Token sudah kedaluwarsa.',
//       });
//     }

//     if (error.name === 'JsonWebTokenError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Token tidak valid.',
//       });
//     }

//     console.error('Error resetting password:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Terjadi kesalahan pada server.',
//     });
//   }
// };






// module.exports = { sendPasswordResetEmail, resetPassword };



const bcrypt = require('bcrypt');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// Konfigurasi OAuth2 untuk Gmail
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// Fungsi untuk mengirimkan email dengan kode reset
const resetCodes = {}; // In-memory storage untuk kode reset

const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email tidak terdaftar.',
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000); // 6-digit random code

    // Simpan kode dan waktu kedaluwarsa
    resetCodes[email] = {
      code: resetCode,
      expiresAt: Date.now() + 15 * 60 * 1000, // Berlaku 15 menit
    };

    console.log(`Kode reset untuk ${email}: ${resetCode}`);


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
      subject: 'Reset Password',
      text: `Kode reset Anda adalah: ${resetCode}\n\nKode ini hanya berlaku selama 15 menit.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Jika email terdaftar, kode reset password telah dikirim.',
    });
  } catch (error) {
    console.error('Error sending reset password email:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    });
  }
};


// Fungsi untuk mereset password
const resetPassword = async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  try {
  console.log(`Reset code dari request: ${resetCode}`);
console.log(`Reset code di server:`, resetCodes[email]);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      });
    }

    // Validasi kode reset
    if (!resetCodes[email]) {
  console.log('Tidak ditemukan entri untuk email:', email);
  return res.status(400).json({ success: false, message: 'Kode reset tidak valid.' });
}

if (resetCodes[email].code.toString() !== resetCode.toString()) {
  console.log('Kode tidak cocok:', {
    dariClient: resetCode,
    diServer: resetCodes[email].code,
  });
  return res.status(400).json({ success: false, message: 'Kode reset tidak valid.' });
}

if (Date.now() > resetCodes[email].expiresAt) {
  console.log('Kode kedaluwarsa:', {
    sekarang: Date.now(),
    batas: resetCodes[email].expiresAt,
  });
  return res.status(400).json({ success: false, message: 'Kode reset sudah kedaluwarsa.' });
}


    // Hapus kode setelah validasi berhasil
    delete resetCodes[email];

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password pengguna
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password berhasil diubah.',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    });
  }
};


module.exports = { sendPasswordResetEmail, resetPassword };


