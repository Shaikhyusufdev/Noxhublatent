const { getVideos } = require('../../lib/videos');
const { getStreamUrl } = require('../../lib/s3');
const { recordView } = require('../../lib/analytics');

// Optional lower-quality copies live in video.qualities, e.g. { "720": "Latent/ep1_720.mp4", "480": "...", "360": "..." }
const QUALITY_LEVELS = [720, 480, 360];

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;
  const videos = await getVideos();
  const video = videos.find((v) => v.id === id);
  if (!video) return res.status(404).json({ error: 'Episode not found' });

  try {
    // highest first: Original, then 720p / 480p / 360p if they were added
    const sources = [{ label: 'Original', height: 9999, url: await getStreamUrl(video.videoKey) }];

    const q = video.qualities || {};
    for (const h of QUALITY_LEVELS) {
      if (q[h]) sources.push({ label: `${h}p`, height: h, url: await getStreamUrl(q[h]) });
    }

    await recordView(id); // counted before responding, since Vercel functions can terminate right after res.json()

    res.setHeader('Cache-Control', 'no-store');
    // `url` kept for backwards compatibility
    res.status(200).json({ url: sources[0].url, sources });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not generate a stream link. Check the object key and AceCloud credentials.' });
  }
};
