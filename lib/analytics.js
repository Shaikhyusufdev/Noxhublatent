const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();
const KEY = 'views'; // single Redis hash: { videoId: count }

async function recordView(id) {
  try {
    await redis.hincrby(KEY, id, 1);
  } catch (err) {
    // never let analytics break actual streaming
    console.error('view tracking failed', err);
  }
}

async function getViews() {
  try {
    const data = await redis.hgetall(KEY);
    return data || {};
  } catch (err) {
    console.error('failed to read views', err);
    return {};
  }
}

module.exports = { recordView, getViews };
