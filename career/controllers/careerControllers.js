const axios = require('axios');
const Recomendation = require('../../authentication/models/Recomendation');
const YOUTUBE_API_KEY = process.env.API_KEY;

const getPlaylists = async (playlistId) => {
    const apiKey = YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        console.log('API response:', response.data); 

        const videoUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&key=${apiKey}`;
        const videoResponse = await axios.get(videoUrl);
        const videos = videoResponse.data.items;
        
        if (response.data && response.data.items) {
            const playlists = response.data.items;
            const formattedPlaylists = playlists.map(playlist => ({
                kind: "youtube#playlist",
                id: playlist.id,
                snippet: {
                    playlistLink: `https://www.youtube.com/playlist?list=${playlist.id}`,
                    title: playlist.snippet.title,
                    description: playlist.snippet.description,
                    thumbnails: playlist.snippet.thumbnails,
                    channelId: playlist.snippet.channelId,
                    channelTitle: playlist.snippet.channelTitle,
                    videos: videos.map(video => ({
                        videoLink: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`,
                        title: video.snippet.title,
                        description: video.snippet.description,
                        thumbnails: video.snippet.thumbnails
                    }))
                }
            }));
 
            return formattedPlaylists;
        } else {
            console.error('No playlists');
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
    }
};


const getFeedback = async (feedback) => {
    console.log('Video ID:', feedback);
    const apiKey = YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${feedback}&key=${apiKey}`;
  
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


const getKarirByName = async (req, res) => {
    try {
        const { name } = req.params;
        console.log('Nama karir dari parameter:', name);

        const karir = await Recomendation.findOne({
            where: { nama_karir: name },
            attributes: ['nama_karir', 'skill', 'pendidikan', 'insight', 'video','playlistId','feedback','image'],
        });

        if (!karir) {
            return res.status(404).json({ error: "Karir tidak ditemukan" });
        }

        const cleanText = (text) => {
            return text.replace(/\r\n/g, '\n').split('\n');
        };

        const playlists = await getPlaylists(karir.playlistId);

        const Vfeedback = await getFeedback(karir.feedback);

        res.status(200).json({
            namaKarir: karir.nama_karir,
            skill: cleanText(karir.skill),
            pendidikan: cleanText(karir.pendidikan),
            insight: cleanText(karir.insight),
            video: playlists,
            feedback:Vfeedback,
            image:karir.image
        });
    } catch (error) {
        console.error('Error fetching karir by ID:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    getKarirByName,
};

