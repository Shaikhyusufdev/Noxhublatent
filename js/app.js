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
const SKIP_SECONDS = 5; // max jump per click; free seeking is disabled

const rowsEl = document.getElementById('rows');

const overlay = document.getElementById('playerOverlay');
const videoEl = document.getElementById('playerVideo');
const titleEl = document.getElementById('playerTitle');
const descEl = document.getElementById('playerDescription');
const closeBtn = document.getElementById('closeBtn');

const stageEl = document.getElementById('playerStage');
const spinnerEl = document.getElementById('bufferSpinner');
const playPauseBtn = document.getElementById('playPauseBtn');
const back5Btn = document.getElementById('back5Btn');
const fwd5Btn = document.getElementById('fwd5Btn');
const muteBtn = document.getElementById('muteBtn');
const fsBtn = document.getElementById('fsBtn');
const timeLabel = document.getElementById('timeLabel');
const progressPlayed = document.getElementById('progressPlayed');
const progressBuffered = document.getElementById('progressBuffered');

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
  resetPlayerUi();
  showSpinner(true);

  try {
    const res = await fetch(`/api/stream/${item.id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not load video');

    videoEl.src = data.url;
    descEl.textContent = item.description || '';
    videoEl.play().catch(() => {});
    attachFirstWatchTracker();
  } catch (err) {
    showSpinner(false);
    descEl.textContent = 'Could not load this video right now. Please try again.';
  }
}

function closePlayer() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
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
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
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

/* =====================================================================
   Custom player: 5s skip buttons, no free seeking, buffering spinner
   ===================================================================== */

let lastGoodTime = 0; // last position reached by normal playback / allowed skips
let skipping = false; // true while one of OUR skip buttons is seeking
let idleTimer = null;

function fmtTime(t) {
  if (!isFinite(t) || t < 0) t = 0;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const sec = Math.floor(t % 60);
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

function showSpinner(on) {
  spinnerEl.classList.toggle('show', on);
}

function resetPlayerUi() {
  lastGoodTime = 0;
  skipping = false;
  progressPlayed.style.width = '0%';
  progressBuffered.style.width = '0%';
  timeLabel.textContent = '0:00 / 0:00';
  stageEl.classList.remove('playing', 'idle');
}

function updateProgress() {
  const dur = videoEl.duration;
  if (!isFinite(dur) || dur <= 0) return;
  progressPlayed.style.width = `${(videoEl.currentTime / dur) * 100}%`;
  timeLabel.textContent = `${fmtTime(videoEl.currentTime)} / ${fmtTime(dur)}`;
}

function updateBuffered() {
  const dur = videoEl.duration;
  if (!isFinite(dur) || dur <= 0) return;
  const t = videoEl.currentTime;
  const b = videoEl.buffered;
  let end = 0;
  for (let i = 0; i < b.length; i++) {
    if (b.start(i) <= t + 0.25 && b.end(i) >= t) {
      end = b.end(i);
      break;
    }
  }
  progressBuffered.style.width = `${(end / dur) * 100}%`;
}

function togglePlay() {
  if (videoEl.paused || videoEl.ended) {
    videoEl.play().catch(() => {});
  } else {
    videoEl.pause();
  }
}

function skipBy(delta) {
  if (!videoEl.src) return;
  const dur = videoEl.duration || 0;
  const target = Math.max(0, Math.min(dur ? dur - 0.1 : Infinity, videoEl.currentTime + delta));
  if (Math.abs(target - videoEl.currentTime) < 0.05) return;
  skipping = true;
  lastGoodTime = target;
  videoEl.currentTime = target;
  updateProgress();
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  } else if (stageEl.requestFullscreen) {
    stageEl.requestFullscreen().catch(() => {});
  } else if (videoEl.webkitEnterFullscreen) {
    videoEl.webkitEnterFullscreen(); // iPhone Safari (native controls; seek guard below still applies)
  }
}

function wakeControls() {
  stageEl.classList.remove('idle');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => stageEl.classList.add('idle'), 2800);
}

playPauseBtn.addEventListener('click', togglePlay);
back5Btn.addEventListener('click', () => skipBy(-SKIP_SECONDS));
fwd5Btn.addEventListener('click', () => skipBy(SKIP_SECONDS));
fsBtn.addEventListener('click', toggleFullscreen);
muteBtn.addEventListener('click', () => {
  videoEl.muted = !videoEl.muted;
});

videoEl.addEventListener('click', () => {
  togglePlay();
  wakeControls();
});
videoEl.addEventListener('dblclick', toggleFullscreen);
stageEl.addEventListener('mousemove', wakeControls);
stageEl.addEventListener('touchstart', wakeControls, { passive: true });

videoEl.addEventListener('play', () => stageEl.classList.add('playing'));
videoEl.addEventListener('pause', () => {
  stageEl.classList.remove('playing');
  stageEl.classList.remove('idle');
});
videoEl.addEventListener('ended', () => {
  stageEl.classList.remove('playing', 'idle');
  lastGoodTime = 0; // so replay (auto-seek to 0) isn't blocked by the seek guard
});
videoEl.addEventListener('volumechange', () => {
  stageEl.classList.toggle('is-muted', videoEl.muted || videoEl.volume === 0);
});

videoEl.addEventListener('loadedmetadata', updateProgress);
videoEl.addEventListener('timeupdate', () => {
  if (!videoEl.seeking) lastGoodTime = videoEl.currentTime;
  updateProgress();
  updateBuffered();
});
videoEl.addEventListener('progress', updateBuffered);

/* buffering spinner */
['waiting', 'seeking', 'loadstart'].forEach((ev) =>
  videoEl.addEventListener(ev, () => {
    if (videoEl.src) showSpinner(true);
  })
);
['playing', 'canplay', 'canplaythrough', 'seeked', 'error', 'emptied'].forEach((ev) =>
  videoEl.addEventListener(ev, () => {
    if (ev === 'seeked') skipping = false;
    if (ev !== 'canplay' || videoEl.readyState >= 3) showSpinner(false);
  })
);

/* safety net: any seek that did not come from our 5s buttons and jumps
   further than 5s (native fullscreen on iPhone, media keys, etc.) is undone */
videoEl.addEventListener('seeking', () => {
  if (skipping) return;
  if (Math.abs(videoEl.currentTime - lastGoodTime) > SKIP_SECONDS + 0.75) {
    videoEl.currentTime = lastGoodTime;
  }
});

/* keyboard: space/K play-pause, arrows = 5s, F fullscreen, M mute */
document.addEventListener('keydown', (e) => {
  if (!overlay.classList.contains('open')) return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  switch (e.key) {
    case ' ':
    case 'k':
    case 'K':
      e.preventDefault();
      togglePlay();
      wakeControls();
      break;
    case 'ArrowRight':
      e.preventDefault();
      skipBy(SKIP_SECONDS);
      wakeControls();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      skipBy(-SKIP_SECONDS);
      wakeControls();
      break;
    case 'f':
    case 'F':
      toggleFullscreen();
      break;
    case 'm':
    case 'M':
      videoEl.muted = !videoEl.muted;
      break;
  }
});
