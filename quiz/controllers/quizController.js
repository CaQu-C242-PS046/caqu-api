const QuizQuestions = require('../../authentication/models/Quiz');
const UserAnswers = require('../../authentication/models/UserAnswers');
const CareerRecommendations = require('../../authentication/models/CareerRecommendations');


const getQuestionByNumber = async (req, res) => {
  try {
    const { number } = req.params;

    const questionNumber = parseInt(number, 10);
    if (isNaN(questionNumber)) {
      return res.status(400).json({ message: 'Nomor pertanyaan harus berupa angka.' });
    }

    const question = await QuizQuestions.findOne({
      where: { id_questions: questionNumber },
    });

    if (!question) {
      return res.status(404).json({ message: 'Pertanyaan tidak ditemukan.' });
    }

    res.status(200).json({
      question: question.question_text,
      questionNumber,
    });
  } catch (error) {
    console.error('Error saat mengambil pertanyaan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};


const submitAnswer = async (req, res) => {
  const userId = req.user.id; 
  const { question_id, answer } = req.body;

  try {
    const existingAnswer = await UserAnswers.findOne({
      where: { user_id: userId, question_id: question_id },
    });

    if (existingAnswer) {
      await existingAnswer.update({ answer });
      res.status(200).json({
        success: true,
        message: 'Jawaban berhasil diperbarui',
      });
    } else {
      await UserAnswers.create({
        user_id: userId,
        question_id: question_id,
        answer,
      });
      res.status(201).json({
        success: true,
        message: 'Jawaban berhasil disimpan',
      });
    }
  } catch (error) {
    console.error('Error saat menyimpan jawaban:', error);
    res.status(500).send('Terjadi kesalahan saat menyimpan jawaban.');
  }
};

const getQuizStatus = async (req, res) => {
  const userId = req.user.id;

  try {
      const allQuestions = await QuizQuestions.findAll({
          attributes: ['id_questions', 'question_text']
      });

      const answeredQuestions = await UserAnswers.findAll({
          where: { user_id: userId },
          attributes: ['question_id']
      });

      console.log('Answered Questions:', answeredQuestions);

      const answeredIds = answeredQuestions.map(answer => answer.question_id);

      const quizStatus = allQuestions.map(question => {
          return {
              questionId: question.id_questions,
              questionText: question.question_text,
              answered: answeredIds.includes(question.id_questions)
          };
      });

      res.status(200).json({
          success: true,
          message: 'Status kuis berhasil diambil.',
          quizStatus
      });
  } catch (error) {
      console.error('Error saat mengambil status kuis:', error);
      res.status(500).send('Terjadi kesalahan saat mengambil data status kuis.');
  }
};

// Fungsi mock untuk mendapatkan rekomendasi karir
//sample untuk rekomendasi karir, yang nantinya diganti oleh model ml
const getCareerRecommendation = async (answers) => {
  const recommendation = answers.includes('ya') ? 'Software Engineer' : 'Data Analyst';
  return recommendation;
};

const submitQuiz = async (req, res) => {
  const userId = req.user.id; 

  try {
      const userAnswers = await UserAnswers.findAll({
          where: { user_id: userId },
          attributes: ['answer'],
          order: [['question_id', 'ASC']]
      });

      const answers = userAnswers.map((answer) => answer.answer);

      const recommendedCareer = await getCareerRecommendation(answers);

      await CareerRecommendations.create({
          user_id: userId,
          recommended_career: recommendedCareer
      });

      res.json({
          message: 'Rekomendasi karir berhasil dibuat.',
          recommendedCareer
      });

  } catch (error) {
      console.error('Error saat mengirimkan jawaban kuis:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat mengirimkan jawaban kuis.' });
  }
};



module.exports = {
  getQuestionByNumber,
  submitAnswer,
  getQuizStatus,
  submitQuiz
};
