const QuizQuestions = require('../../authentication/models/Quiz');
const UserAnswers = require('../../authentication/models/UserAnswers');
const user = require('../../authentication/models/User');
const CareerRecommendations = require('../../authentication/models/CareerRecommendations');
const axios = require('axios');
const flatted = require('flatted');


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

const getUserAnswers = async (req, res) => {
  try {
    const user_id = req.user.id;

    const answers = await UserAnswers.findAll({
      where: { user_id: user_id },
      include: [{
        model: QuizQuestions,
        as: 'QuizQuestion',
        attributes: ['label'], 
      }],
    });

    const formattedAnswers = answers.reduce((result, answer) => {
      result[answer.QuizQuestion.label] = answer.answer;
      return result;
    }, {});

    return formattedAnswers;

  } catch (error) {
    console.error('Gagal mengambil jawaban:', error);
    return res.status(500).send('Internal Server Error');
  }
};

const submitQuiz = async (req, res) => {
  const userId = req.user.id;
  try {
    const userAnswers = await getUserAnswers(req, res);

    if (!userAnswers || Object.keys(userAnswers).length === 0) {
      return res.status(404).json({ message: 'Jawaban pengguna tidak ditemukan.' });
    }

    // Kirim data ke FastAPI
    const response = await fetch("http://127.0.0.1:8000/predict/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userAnswers),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error from FastAPI:', error);
      return res.status(500).json({ message: 'Gagal mendapatkan rekomendasi karir.', error });
    }

    const recommendation = await response.json();
    console.log('Career Recommendation:', recommendation);

    const predictedCareer = recommendation.predicted_career;

    await CareerRecommendations.create({
      user_id: userId,
      recommended_career: predictedCareer
    });

    return res.json(recommendation);

  } catch (error) {
    console.error('Terjadi kesalahan saat mengirim jawaban:', error);
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
};


// const submitQuiz = async (req, res) => {
//   const userId = req.user.id; // Pastikan userId tersedia dari JWT

//   if (!userId) {
//     return res.status(400).json({ message: 'user_id tidak ditemukan dalam request.' });
//   }

//   try {
//     const userAnswers = await getUserAnswers(req,res); 

//     if (!userAnswers || Object.keys(userAnswers).length === 0) {
//       return res.status(404).json({ message: 'Jawaban pengguna tidak ditemukan.' });
//     }

//     console.log(userAnswers);
//     const recommendedCareer = await getCareerRecommendationFromML(userAnswers);



//     await CareerRecommendations.create({
//       user_id: userId,
//       recommended_career: recommendedCareer,
//     });


//     return res.json({
//       message: 'Rekomendasi karir berhasil dibuat.',
//       recommendedCareer,
//     });

//   } catch (error) {
//     console.error('Error saat mengirimkan jawaban kuis:', error);

//     if (!res.headersSent) {
//       return res.status(500).json({ message: 'Terjadi kesalahan saat memproses rekomendasi karir.' });
//     }
//   }
// };





module.exports = {
  getQuestionByNumber,
  submitAnswer,
  getQuizStatus,
  getUserAnswers,
  submitQuiz
};
