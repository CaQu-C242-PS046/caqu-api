const express = require('express');
require('dotenv').config();
const authRoutes = require('./authentication/routes/authRoutes');
const protectedRoute = require('./authentication/routes/protectedRoute');
const resetPasswordRoutes = require('./authentication/routes/resetPasswordRoutes');
const homeRoutes = require('./homepage/routes/homeRoutes');
const profileRoutes = require('./authentication/routes/profileRoutes');
const quizRoutes = require('./quiz/routes/quizRoutes');
const careerRoutes = require('./career/routes/careerRoutes');
const softSkillsRoutes = require('./softSkills/routes/softSkillsRoutes');
require('./authentication/models/association');
const app = express();

// Endpoint untuk menampilkan pesan "Koneksi berhasil"
app.get('/', (req, res) => {
  res.send('Koneksi berhasil');
});

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/', protectedRoute);
app.use('/', resetPasswordRoutes);
app.use('/', homeRoutes);
app.use('/profile', profileRoutes);
app.use('/quiz', quizRoutes);
app.use('/', careerRoutes);
app.use('/', softSkillsRoutes);

const PORT = 8081;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
