const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();
const KEY = 'videos';

async function getVideos() {
  const data = await redis.get(KEY);
  return data || [];
}

async function saveVideos(videos) {
  await redis.set(KEY, videos);
}

module.exports = { getVideos, saveVideos };
