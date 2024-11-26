const QuizQuestions = require('./Quiz');
const UserAnswers = require('./UserAnswers');

// Definisi asosiasi
QuizQuestions.hasMany(UserAnswers, {
  foreignKey: 'question_id',
  as: 'UserAnswers',
});

UserAnswers.belongsTo(QuizQuestions, {
  foreignKey: 'question_id',
  as: 'QuizQuestion',
});

// Export jika diperlukan
module.exports = { QuizQuestions, UserAnswers };
