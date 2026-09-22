const { checkAdmin } = require('../../lib/auth');
const { getVideos } = require('../../lib/videos');
const { getViews } = require('../../lib/analytics');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  if (!checkAdmin(req, res)) return;

  const [videos, views] = await Promise.all([getVideos(), getViews()]);

  const rows = videos
    .map((v) => ({
      id: v.id,
      title: v.title,
      category: v.category,
      views: Number(views[v.id] || 0),
    }))
    .sort((a, b) => b.views - a.views);

  const totalViews = rows.reduce((sum, r) => sum + r.views, 0);

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ rows, totalViews });
};
