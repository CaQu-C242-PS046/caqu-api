// authentication/models/QuizQuestions.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const QuizQuestions = sequelize.define('QuizQuestions', {
  id_questions: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'quizQuestions',
  timestamps: false, // Menonaktifkan kolom createdAt dan updatedAt
});

module.exports = QuizQuestions;
