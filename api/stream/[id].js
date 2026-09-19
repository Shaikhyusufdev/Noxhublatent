const { getVideos } = require('../../lib/videos');
const { getStreamUrl } = require('../../lib/s3');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;
  const videos = await getVideos();
  const video = videos.find((v) => v.id === id);
  if (!video) return res.status(404).json({ error: 'Episode not found' });

  try {
    const url = await getStreamUrl(video.videoKey);
    res.status(200).json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not generate a stream link. Check the object key and AceCloud credentials.' });
  }
};
