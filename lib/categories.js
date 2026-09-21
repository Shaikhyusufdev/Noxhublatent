const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();
const KEY = 'categories';

// Used until the first category is added/removed from the admin panel.
// Same order the homepage had before, so nothing changes for existing videos.
const DEFAULT_CATEGORIES = [
  { key: 'trending', label: 'Trending', icon: '🔥' },
  { key: 'members', label: 'Members Only', icon: '👑' },
  { key: 'bonus', label: 'Bonus Episodes', icon: '🎁' },
  { key: 'premium', label: 'Premium Episodes', icon: '💎' },
];

async function getCategories() {
  const data = await redis.get(KEY);
  return Array.isArray(data) && data.length ? data : DEFAULT_CATEGORIES;
}

async function saveCategories(list) {
  await redis.set(KEY, list);
}

module.exports = { getCategories, saveCategories, DEFAULT_CATEGORIES };
