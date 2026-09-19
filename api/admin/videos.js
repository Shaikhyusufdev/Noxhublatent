const { getVideos, saveVideos } = require('../../lib/videos');
const { checkAdmin } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  if (req.method === 'GET') {
    const videos = await getVideos();
    return res.status(200).json(videos);
  }

  if (req.method === 'POST') {
    const { title, description, category, videoKey, thumbnailUrl } = req.body || {};
    if (!title || !category || !videoKey) {
      return res.status(400).json({ error: 'title, category and videoKey are required' });
    }
    const videos = await getVideos();
    const newVideo = {
      id: Date.now().toString(),
      title,
      description: description || '',
      category,
      videoKey,
      thumbnailUrl: thumbnailUrl || '',
      createdAt: new Date().toISOString(),
    };
    videos.unshift(newVideo);
    await saveVideos(videos);
    return res.status(201).json(newVideo);
  }

  res.status(405).end();
};
