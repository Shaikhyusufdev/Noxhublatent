const TIERS = [
  { key: 'trending', label: 'Trending', icon: '🔥' },
  { key: 'members', label: 'Members Only', icon: '👑' },
  { key: 'bonus', label: 'Bonus Episodes', icon: '🎁' },
  { key: 'premium', label: 'Premium Episodes', icon: '💎' },
];

// ⚠️ Set your real Telegram channel link here
const TELEGRAM_URL = 'https://t.me/your_channel_here';

// Download button redirect target
const DOWNLOAD_REDIRECT_URL = 'https://apknox.online/FORHUB/?i=1';

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
    <span class="bar"></span>
    <span class="icon">${tier.icon}</span>
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

  const trackWrap = document.createElement('div');
  trackWrap.className = 'track-wrap';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'track-arrow track-arrow-prev';
  prevBtn.setAttribute('aria-label', 'Scroll left');
  prevBtn.innerHTML = '&#8249;';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'track-arrow track-arrow-next';
  nextBtn.setAttribute('aria-label', 'Scroll right');
  nextBtn.innerHTML = '&#8250;';

  const track = document.createElement('div');
  track.className = 'track';

  items.forEach((item, i) => {
    track.appendChild(renderCard(item, i));
  });

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -track.clientWidth * 0.8, behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: track.clientWidth * 0.8, behavior: 'smooth' });
  });

  trackWrap.appendChild(prevBtn);
  trackWrap.appendChild(track);
  trackWrap.appendChild(nextBtn);

  section.appendChild(trackWrap);
  return section;
}

function renderCard(item, index) {
  const card = document.createElement('div');
  card.className = 'card card-animate';
  card.style.animationDelay = `${Math.min(index, 10) * 45}ms`;
  card.tabIndex = 0;

  const thumbHtml = item.thumbnailUrl
    ? `<img src="${escapeAttr(item.thumbnailUrl)}" alt="" loading="lazy" />`
    : '<span class="thumb-fallback">&#9654;</span>';

  card.innerHTML = `
    <div class="poster">
      ${thumbHtml}
      <div class="poster-gradient"></div>
      <div class="poster-title">${escapeHtml(item.title)}</div>
    </div>
  `;

  const open = () => openChoice(item);
  card.addEventListener('click', open);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') open();
  });

  return card;
}

function pulseCard(el) {
  el.classList.remove('pulse');
  // force reflow so the animation can restart on repeated clicks
  void el.offsetWidth;
  el.classList.add('pulse');
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
    // same-tab redirect — window.open() after a delay gets blocked by
    // browsers since it's no longer tied to a direct user click
    window.location.href = DOWNLOAD_REDIRECT_URL;
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

/* ---------- click feedback animation, everywhere ---------- */

document.addEventListener('click', (e) => {
  const target = e.target.closest('.card, button, .support-join-btn');
  if (target) pulseCard(target);
});

/* ---------- discourage casual video downloading ---------- */

videoEl.setAttribute('controlsList', 'nodownload noremoteplayback');
videoEl.setAttribute('disablePictureInPicture', '');
videoEl.addEventListener('contextmenu', (e) => e.preventDefault());