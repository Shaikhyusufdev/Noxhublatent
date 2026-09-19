const { getVideos } = require('../lib/videos');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  const videos = await getVideos();
  const { category } = req.query;
  const result = category ? videos.filter((v) => v.category === category) : videos;
  res.status(200).json(result);
};
