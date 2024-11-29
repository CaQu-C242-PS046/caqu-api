const SoftSkills = require('../../authentication/models/SoftSkills');
const axios = require('axios');
const YOUTUBE_API_KEY = process.env.API_KEY;

const getAllSoftSkillNames = async (req, res) => {
  try {
    const softSkills = await SoftSkills.findAll({
      attributes: ['nama_ss'],
    });

    if (!softSkills.length) {
      return res.status(404).json({
        message: 'No soft skills found',
      });
    }

    return res.status(200).json({
      data: softSkills.map(skill => skill.nama_ss),
    });
  } catch (error) {
    console.error('Error fetching soft skill names:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};


const getVideoDetails = async (videoId) => {
  console.log('Video ID:', videoId);
  const apiKey = YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

  try {
      const response = await axios.get(url);
      console.log('API response:', response.data);

      if (response.data && response.data.items) {
          const video = response.data.items[0]; 
          const formattedVideo = {
              videoLink: `https://www.youtube.com/watch?v=${video.id}`,
              title: video.snippet.title,
              description: video.snippet.description,
              thumbnails: video.snippet.thumbnails,
              channelId: video.snippet.channelId,
              channelTitle: video.snippet.channelTitle,
              publishedAt: video.snippet.publishedAt
          };

          return formattedVideo;
      } else {
          console.error('Video not found');
          return null;
      }
  } catch (error) {
      if (error.response) {
          console.error('Error response from API:', error.response.data);
          console.error('Status code:', error.response.status);
      } else if (error.request) {
          console.error('No response received from API:', error.request);
      } else {
          console.error('Error setting up request:', error.message);
      }
      return null;
  }
};

const getSoftSkillsByName = async (req, res) => {
  try {
    const { name } = req.params;

    const softSkill = await SoftSkills.findOne({
      where: { nama_ss: name },
      attributes: ['nama_ss', 'artikel', 'video', 'videoId'],
    });

    if (!softSkill) {
      return res.status(404).json({
        message: 'Soft skill tidak ditemukan',
      });
    }

    const cleanText = (text) => {
      return text.replace(/\r\n/g, '\n').split('\n');
  };

  const videos = await getVideoDetails(softSkill.videoId);

    res.status(200).json({
      nama_ss: softSkill.nama_ss,
      artikel: cleanText(softSkill.artikel),
      video: videos
    });

  } catch (error) {
    console.error('Error fetching soft skill by ID:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

module.exports = { getSoftSkillsByName, getAllSoftSkillNames };
