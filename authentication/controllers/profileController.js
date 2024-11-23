const { Storage } = require('@google-cloud/storage');
const User = require('../models/User');
const storage = new Storage({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS });
const bucketName = process.env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);
 
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileName = Date.now() + '-' + req.file.originalname;
    const file = bucket.file(fileName);
    const blobStream = file.createWriteStream({
      resumable: false,
      contentType: req.file.mimetype,
    });

    blobStream.on('error', (err) => {
      console.error('Error uploading file:', err);
      return res.status(500).json({ message: 'Error uploading file' });
    });

    blobStream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

      const userId = req.user.id;
      console.log('User ID:', req.user?.id);

      await User.update({ profile_picture_url: publicUrl }, { where: { id_login: userId } });

      res.status(200).json({
        message: 'Foto profile berhasil di update',
        profilePictureUrl: publicUrl,
      });
    });

    blobStream.end(req.file.buffer);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getProfilePicture = async (req, res) => {
  const userId = req.params.userId;

  const user = await User.findOne({ where: { id_login: userId } });

  if (!user || !user.profile_picture_url) {
    return res.status(404).json({ message: 'Profile picture not found' });
  }

  res.json({ profilePictureUrl: user.profile_picture_url });
};

module.exports = { uploadProfilePicture, getProfilePicture };
