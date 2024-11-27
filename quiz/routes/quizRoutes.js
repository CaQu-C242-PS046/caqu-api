const express = require('express');
const { getQuestionByNumber, submitAnswer, getQuizStatus, submitQuiz } = require('../controllers/quizController');
const authenticateToken = require('../../authentication/middleware/authMiddleware');
const router = express.Router();

router.get('/question/:number', authenticateToken, getQuestionByNumber);
router.post('/answer', authenticateToken, submitAnswer);
router.get('/quiz-status', authenticateToken, getQuizStatus);
router.post('/submitQuiz', authenticateToken, submitQuiz);
module.exports = router;
