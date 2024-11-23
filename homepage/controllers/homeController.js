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

module.exports = {
  getHomePage
};

