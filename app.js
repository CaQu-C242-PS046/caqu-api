require('dotenv').config();
const express = require('express');
const authRoutes = require('./authentication/routes/authRoutes');
const protectedRoute = require('./authentication/routes/protectedRoute');
const resetPasswordRoutes = require('./authentication/routes/resetPasswordRoutes');
const homeRoutes = require('./homepage/routes/homeRoutes');
const quizRoutes = require('./quiz/routes/quizRoutes');
const careerRoutes = require('./career/routes/careerRoutes');
const softSkillsRoutes = require('./softSkills/routes/softSkillsRoutes');
const profileRoutes = require('./authentication/routes/profileRoutes');
require('./authentication/models/association');
const cors = require('cors');
const app = express();

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: 'http://127.0.0.1:5500', // Origin frontend
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type','Cross-Origin-Opener-Policy'],
  credentials: true,
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions))

app.use('/auth', authRoutes);
app.use('/', protectedRoute);
app.use('/', resetPasswordRoutes);
app.use('/', homeRoutes);
app.use('/quiz', quizRoutes);
app.use('/', careerRoutes);
app.use('/', softSkillsRoutes);
app.use('/profile', profileRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
