const axios = require('axios'); // Import axios

// Fungsi untuk menangani request dari frontend
const handleProxyRequest = async (req, res) => {
  const { data } = req.body; // Ambil data yang dikirim dari frontend

  try {
    // Kirim data ke server iframe menggunakan axios
    const response = await axios.post('https://iframe-server.com/api', 
      { data }, 
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Ambil respons dari server iframe dan kembalikan ke frontend
    res.json(response.data);
  } catch (error) {
    console.error('Error forwarding request:', error);
    res.status(500).json({ error: 'Failed to communicate with iframe server' });
  }
};

// Export controller function
module.exports = {
  handleProxyRequest,
};
