const TIERS = [
  { key: 'members', label: 'Members Only' },
  { key: 'bonus', label: 'Bonus Episodes' },
  { key: 'premium', label: 'Premium Episodes' },
];

const rowsEl = document.getElementById('rows');
const overlay = document.getElementById('playerOverlay');
const videoEl = document.getElementById('playerVideo');
const titleEl = document.getElementById('playerTitle');
const descEl = document.getElementById('playerDescription');
const closeBtn = document.getElementById('closeBtn');

async function loadVideos() {
  const res = await fetch('/api/videos');
  const videos = await res.json();

  TIERS.forEach((tier) => {
    const items = videos.filter((v) => v.category === tier.key);
    rowsEl.appendChild(renderRow(tier, items));
  });
}

function renderRow(tier, items) {
  const section = document.createElement('section');
  section.className = 'row';
  section.dataset.tier = tier.key;

  const heading = document.createElement('div');
  heading.className = 'row-heading';
  heading.innerHTML = `
    <span class="dot"></span>
    <h2>${tier.label}</h2>
    <span class="count">${items.length} episode${items.length === 1 ? '' : 's'}</span>
  `;
  section.appendChild(heading);

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No episodes here yet.';
    section.appendChild(empty);
    return section;
  }

  const track = document.createElement('div');
  track.className = 'track';

  items.forEach((item) => {
    track.appendChild(renderCard(item));
  });

  section.appendChild(track);
  return section;
}

function renderCard(item) {
  const card = document.createElement('div');
  card.className = 'card';
  card.tabIndex = 0;

  const thumbHtml = item.thumbnailUrl
    ? `<img src="${escapeAttr(item.thumbnailUrl)}" alt="" loading="lazy" />`
    : '&#9654;';

  card.innerHTML = `
    <div class="thumb">${thumbHtml}</div>
    <div class="meta">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description || '')}</p>
    </div>
  `;

  const open = () => openPlayer(item);
  card.addEventListener('click', open);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') open();
  });

  return card;
}

async function openPlayer(item) {
  titleEl.textContent = item.title;
  descEl.textContent = 'Loading...';
  overlay.classList.add('open');
  videoEl.removeAttribute('src');
  videoEl.load();

  try {
    const res = await fetch(`/api/stream/${item.id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not load video');

    videoEl.src = data.url;
    descEl.textContent = item.description || '';
    videoEl.play().catch(() => {});
  } catch (err) {
    descEl.textContent = 'Could not load this video right now. Please try again.';
  }
}

function closePlayer() {
  overlay.classList.remove('open');
  videoEl.pause();
  videoEl.removeAttribute('src');
  videoEl.load();
}

closeBtn.addEventListener('click', closePlayer);
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closePlayer();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePlayer();
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;');
}

loadVideos();
