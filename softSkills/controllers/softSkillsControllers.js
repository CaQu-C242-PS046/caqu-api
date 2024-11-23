const SoftSkills = require('../../authentication/models/SoftSkills');
const axios = require('axios');
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const getAllSoftSkillNames = async (res) => {
  try {
    const softSkills = await SoftSkills.findAll({
      attributes: ['nama_ss'],
    });

    if (!softSkills.length) { 
      return res.status(404).json({
        message: 'No soft skills found',
      });
    }

    res.status(200).json(softSkills.map(skill => skill.nama_ss));
  } catch (error) {
    console.error('Error fetching soft skill names:', error);
    res.status(500).json({
      message: 'Internal server error',
    }); 
  }
};

const getYoutubeThumbnailAndVideoId = async (playlistUrl) => {
  try {
      const playlistId = new URLSearchParams(new URL(playlistUrl).search).get('list');

      if (!playlistId) {
          return null;
      }

      const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
          params: {
              part: 'snippet',
              playlistId: playlistId,
              key: YOUTUBE_API_KEY,
              maxResults: 1, 
          },
      });

      const items = response.data.items;
      if (items && items.length > 0) {
          const videoId = items[0].snippet.resourceId.videoId;
          const thumbnailUrl = items[0].snippet.thumbnails.default.url;
          return { thumbnailUrl, videoId };
      }

      return null;
  } catch (error) {
      console.error('Error fetching YouTube video and thumbnail:', error);
      return null;
  }
};

const getSoftSkillsById = async (req, res) => {
  try {
    const { id } = req.params;

    const softSkill = await SoftSkills.findOne({
      where: { id_ss: id },
      attributes: ['nama_ss', 'artikel', 'video'],
    });

    if (!softSkill) {
      return res.status(404).json({
        message: 'Soft skill not found',
      });
    }

    let videoData = null;
    if (softSkill.video) {
        videoData = await getYoutubeThumbnailAndVideoId(softSkill.video);
    }

    const cleanText = (text) => {
      return text.replace(/\r\n/g, '\n').split('\n');
  };

    res.status(200).json({
      nama_ss: softSkill.nama_ss,
      artikel: cleanText(softSkill.artikel),
      video: {
        playlistUrl: softSkill.video,
        thumbnailUrl: videoData ? videoData.thumbnailUrl : null,
        videoUrl: videoData ? `https://www.youtube.com/embed/${videoData.videoId}` : null, // URL video yang dapat disematkan
      },
    });

  } catch (error) {
    console.error('Error fetching soft skill by ID:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

module.exports = { getSoftSkillsById, getAllSoftSkillNames };
