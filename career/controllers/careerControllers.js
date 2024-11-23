const axios = require('axios');
const Recomendation = require('../../authentication/models/recomendation');
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

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


const getKarirById = async (req, res) => {
    try {
        const { id } = req.params;

        const karir = await Recomendation.findOne({
            where: { id_karir: id },
            attributes: ['nama_karir', 'skill', 'pendidikan', 'insight', 'video'],
        });

        if (!karir) {
            return res.status(404).json({ error: "Karir tidak ditemukan" });
        }

        let videoData = null;
        if (karir.video) {
            videoData = await getYoutubeThumbnailAndVideoId(karir.video);
        }

        const cleanText = (text) => {
            return text.replace(/\r\n/g, '\n').split('\n');
        };

        res.status(200).json({
            namaKarir: karir.nama_karir,
            skill: cleanText(karir.skill),
            pendidikan: cleanText(karir.pendidikan),
            insight: cleanText(karir.insight),  
            video: {
                playlistUrl: karir.video,
                thumbnailUrl: videoData ? videoData.thumbnailUrl : null,
                videoUrl: videoData ? `https://www.youtube.com/embed/${videoData.videoId}` : null,
            },
        });
    } catch (error) {
        console.error('Error fetching karir by ID:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    getKarirById,
};

