const TIERS = [
  { key: 'trending', label: 'Trending' },
  { key: 'members', label: 'Members Only' },
  { key: 'bonus', label: 'Bonus Episodes' },
  { key: 'premium', label: 'Premium Episodes' },
];

// ⚠️ Set your real Telegram channel link here
const TELEGRAM_URL = 'https://t.me/NOXHUB1';

const FIRST_WATCH_SECONDS = 5 * 60; // 5 minutes
const COUNTDOWN_SECONDS = 5;

const rowsEl = document.getElementById('rows');

const overlay = document.getElementById('playerOverlay');
const videoEl = document.getElementById('playerVideo');
const titleEl = document.getElementById('playerTitle');
const descEl = document.getElementById('playerDescription');
const closeBtn = document.getElementById('closeBtn');

const choiceOverlay = document.getElementById('choiceOverlay');
const choiceTitle = document.getElementById('choiceTitle');
const streamChoiceBtn = document.getElementById('streamChoiceBtn');
const downloadChoiceBtn = document.getElementById('downloadChoiceBtn');
const choiceCancelBtn = document.getElementById('choiceCancelBtn');

const countdownOverlay = document.getElementById('countdownOverlay');
const countdownNumber = document.getElementById('countdownNumber');
const countdownBarFill = document.getElementById('countdownBarFill');

const supportOverlay = document.getElementById('supportOverlay');
const supportJoinBtn = document.getElementById('supportJoinBtn');
const supportCloseBtn = document.getElementById('supportCloseBtn');

supportJoinBtn.href = TELEGRAM_URL;

let pendingItem = null;
let countdownTimer = null;
let firstWatchListenerAttached = false;

async function loadVideos() {
  const res = await fetch('/api/videos');
  const videos = await res.json();

  TIERS.forEach((tier, tierIndex) => {
    const items = videos.filter((v) => v.category === tier.key);
    rowsEl.appendChild(renderRow(tier, items, tierIndex));
  });
}

function renderRow(tier, items, tierIndex) {
  const section = document.createElement('section');
  section.className = 'row row-animate';
  section.dataset.tier = tier.key;
  section.style.animationDelay = `${tierIndex * 60}ms`;

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

  items.forEach((item, i) => {
    track.appendChild(renderCard(item, i));
  });

  section.appendChild(track);
  return section;
}

function renderCard(item, index) {
  const card = document.createElement('div');
  card.className = 'card card-animate';
  card.style.animationDelay = `${Math.min(index, 10) * 45}ms`;
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

  const open = () => openChoice(item);
  card.addEventListener('click', open);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') open();
  });

  return card;
}

/* ---------- step 1: stream vs download choice ---------- */

function openChoice(item) {
  pendingItem = item;
  choiceTitle.textContent = item.title;
  choiceOverlay.classList.add('open');
}

function closeChoice() {
  choiceOverlay.classList.remove('open');
}

streamChoiceBtn.addEventListener('click', () => {
  const item = pendingItem;
  closeChoice();
  runCountdown(() => openPlayer(item));
});

downloadChoiceBtn.addEventListener('click', () => {
  closeChoice();
  runCountdown(() => {
    window.open(TELEGRAM_URL, '_blank', 'noopener');
  });
});

choiceCancelBtn.addEventListener('click', closeChoice);
choiceOverlay.addEventListener('click', (e) => {
  if (e.target === choiceOverlay) closeChoice();
});

/* ---------- step 2: 5s countdown (ad slot placeholder) ---------- */

function runCountdown(onDone) {
  let secondsLeft = COUNTDOWN_SECONDS;
  countdownNumber.textContent = secondsLeft;
  countdownBarFill.style.transition = 'none';
  countdownBarFill.style.width = '0%';
  countdownOverlay.classList.add('open');

  // kick off the bar animation on next frame
  requestAnimationFrame(() => {
    countdownBarFill.style.transition = `width ${COUNTDOWN_SECONDS}s linear`;
    countdownBarFill.style.width = '100%';
  });

  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    secondsLeft -= 1;
    if (secondsLeft <= 0) {
      clearInterval(countdownTimer);
      countdownOverlay.classList.remove('open');
      onDone();
      return;
    }
    countdownNumber.textContent = secondsLeft;
  }, 1000);
}

/* ---------- step 3a: stream ---------- */

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
    attachFirstWatchTracker();
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

/* ---------- "support us" popup: only on the very first video, after 5 min ---------- */

function attachFirstWatchTracker() {
  if (localStorage.getItem('nox_supportShown')) return; // already shown once, ever
  if (firstWatchListenerAttached) return;

  firstWatchListenerAttached = true;

  function onTimeUpdate() {
    if (videoEl.currentTime >= FIRST_WATCH_SECONDS) {
      videoEl.removeEventListener('timeupdate', onTimeUpdate);
      videoEl.pause();
      localStorage.setItem('nox_supportShown', '1');
      supportOverlay.classList.add('open');
    }
  }

  videoEl.addEventListener('timeupdate', onTimeUpdate);
}

function resumeAfterSupport() {
  supportOverlay.classList.remove('open');
  videoEl.play().catch(() => {});
}

supportJoinBtn.addEventListener('click', () => {
  resumeAfterSupport();
});

supportCloseBtn.addEventListener('click', resumeAfterSupport);

/* ---------- utils ---------- */

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;');
}

loadVideos();