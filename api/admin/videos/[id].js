const { getVideos, saveVideos } = require('../../../lib/videos');
const { checkAdmin } = require('../../../lib/auth');

module.exports = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  const { id } = req.query;
  const videos = await getVideos();
  const idx = videos.findIndex((v) => v.id === id);

  if (req.method === 'DELETE') {
    if (idx === -1) return res.status(404).json({ error: 'Episode not found' });
    videos.splice(idx, 1);
    await saveVideos(videos);
    return res.status(200).json({ success: true });
  }

  if (req.method === 'PUT') {
    if (idx === -1) return res.status(404).json({ error: 'Episode not found' });
    const body = { ...(req.body || {}) };
    if (body.qualities) {
      const clean = {};
      [720, 480, 360].forEach((h) => {
        const v = typeof body.qualities[h] === 'string' ? body.qualities[h].trim() : '';
        if (v) clean[h] = v;
      });
      body.qualities = clean;
    }
    videos[idx] = { ...videos[idx], ...body, id: videos[idx].id };
    await saveVideos(videos);
    return res.status(200).json(videos[idx]);
  }

  res.status(405).end();
};
