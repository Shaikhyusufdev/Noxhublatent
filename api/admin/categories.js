const { getCategories, saveCategories } = require('../../lib/categories');
const { getVideos } = require('../../lib/videos');
const { checkAdmin } = require('../../lib/auth');

// "New Arrivals!" -> "new-arrivals". Falls back to a timestamp if nothing usable is left
// (e.g. a name written fully in Hindi).
function makeKey(label, existing) {
  let base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
  if (!base) base = 'cat-' + Date.now().toString(36);
  let key = base;
  let n = 2;
  while (existing.some((c) => c.key === key)) key = `${base}-${n++}`;
  return key;
}

module.exports = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  const categories = await getCategories();

  if (req.method === 'GET') {
    return res.status(200).json(categories);
  }

  // Add a category. It goes to the START of the list, so it shows at the top of the homepage.
  if (req.method === 'POST') {
    const { label, icon } = req.body || {};
    const cleanLabel = typeof label === 'string' ? label.trim() : '';
    if (!cleanLabel || cleanLabel.length > 40) {
      return res.status(400).json({ error: 'Category name is required (max 40 characters)' });
    }
    if (categories.some((c) => c.label.toLowerCase() === cleanLabel.toLowerCase())) {
      return res.status(409).json({ error: 'A category with this name already exists' });
    }
    const cleanIcon = typeof icon === 'string' && icon.trim() ? icon.trim().slice(0, 8) : '📁';
    const created = { key: makeKey(cleanLabel, categories), label: cleanLabel, icon: cleanIcon };
    await saveCategories([created, ...categories]);
    return res.status(201).json(created);
  }

  // Remove a category (only when it has no episodes, so no video ever disappears from the site)
  if (req.method === 'DELETE') {
    const { key } = req.query;
    if (!categories.some((c) => c.key === key)) {
      return res.status(404).json({ error: 'Category not found' });
    }
    if (categories.length === 1) {
      return res.status(400).json({ error: 'You need at least one category' });
    }
    const videos = await getVideos();
    const used = videos.filter((v) => v.category === key).length;
    if (used > 0) {
      return res.status(409).json({
        error: `This category still has ${used} episode${used === 1 ? '' : 's'}. Move them to another category first.`,
      });
    }
    await saveCategories(categories.filter((c) => c.key !== key));
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
};
