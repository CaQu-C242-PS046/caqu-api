const CareerRecommendations = require('../../authentication/models/CareerRecommendations')

const getHomePage = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Pengguna tidak ditemukan.' });
  }

  try {
    const username = req.user.username;

    res.status(200).send(`Hello, ${username}! Selamat datang di halaman beranda.`);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data.' });
  }
};

const getUserRecommendationHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const recommendations = await CareerRecommendations.findAll({
      where: { user_id: userId },
      attributes: ['recommended_career']
    });

    if (recommendations.length === 0) {
      return res.status(404).json({ message: 'Belum ada riwayat rekomendasi.' });
    }

    return res.status(200).json({
      success: true,
      history: recommendations,
    });
  } catch (error) {
    console.error('Error fetching recommendation history:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil riwayat rekomendasi.' });
  }
};

module.exports = {
  getHomePage, getUserRecommendationHistory
};

