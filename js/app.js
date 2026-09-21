const TIERS = [
  { key: 'trending', label: 'Trending', icon: '🔥' },
  { key: 'members', label: 'Members Only', icon: '👑' },
  { key: 'bonus', label: 'Bonus Episodes', icon: '🎁' },
  { key: 'premium', label: 'Premium Episodes', icon: '💎' },
];

// ⚠️ Set your real Telegram channel link here
const TELEGRAM_URL = 'https://t.me/+KCz9WCY-3f9hYzY1';

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
let prefetchPromise = null;
let prefetchItemId = null;

// starts fetching the signed video link right away, in parallel with the
// countdown, so there's no extra wait once the countdown finishes
function prefetchStream(item) {
  prefetchItemId = item.id;
  prefetchPromise = fetch(`/api/stream/${item.id}`).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not load video');
    return Array.isArray(data.sources) && data.sources.length
      ? data.sources
      : [{ label: 'Original', height: 9999, url: data.url }];
  });
}

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
  prefetchStream(item); // link countdown ke saath hi fetch hona shuru
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
  currentItemId = item.id;
  titleEl.textContent = item.title;
  descEl.textContent = 'Loading...';
  overlay.classList.add('open');
  cancelRebuffer();
  videoEl.removeAttribute('src');
  videoEl.load();
  resetPlayerUi();
  showSpinner(true);

  try {
    const canUsePrefetch = prefetchItemId === item.id && prefetchPromise;
    sources = canUsePrefetch
      ? await prefetchPromise
      : await fetch(`/api/stream/${item.id}`).then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Could not load video');
          return Array.isArray(data.sources) && data.sources.length
            ? data.sources
            : [{ label: 'Original', height: 9999, url: data.url }];
        });

    buildQualityMenu();
    descEl.textContent = item.description || '';

    const resumeAt = getSavedPosition(item.id);
    if (resumeAt) toast(`Continuing from ${fmtTime(resumeAt)}`);
    loadSource(pickInitialSource(), resumeAt);
    attachFirstWatchTracker();
  } catch (err) {
    showSpinner(false);
    descEl.textContent = 'Could not load this video right now. Please try again.';
  } finally {
    prefetchPromise = null;
    prefetchItemId = null;
  }
}

function closePlayer() {
  savePosition();
  leaveFullscreen();
  cancelRebuffer();
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
      showSupportPopup();
    }
  }

  videoEl.addEventListener('timeupdate', onTimeUpdate);
}

const supportMsg = document.getElementById('supportMsg');
const supportContinueBtn = document.getElementById('supportContinueBtn');
const SUPPORT_MSG_DEFAULT = supportMsg.textContent;

let supportResumeAt = 0;   // exact spot where the video was paused for the popup
let awaitingReturn = false; // viewer clicked "Join", we wait for them to come back
let leftPage = false;

function showSupportPopup() {
  supportResumeAt = videoEl.currentTime;
  cancelRebuffer();
  videoEl.pause();
  leaveFullscreen();
  savePosition();
  try { localStorage.setItem('nox_supportShown', '1'); } catch (e) { /* ignore */ }

  awaitingReturn = false;
  leftPage = false;
  supportMsg.textContent = SUPPORT_MSG_DEFAULT;
  supportContinueBtn.hidden = true;
  supportOverlay.classList.add('open');
}

function resumeAfterSupport() {
  awaitingReturn = false;
  leftPage = false;
  supportOverlay.classList.remove('open');

  // continue from the exact same second, never from the start
  if (Math.abs(videoEl.currentTime - supportResumeAt) > 0.5) {
    skipping = true;
    lastGoodTime = supportResumeAt;
    videoEl.currentTime = supportResumeAt;
  }
  // top the buffer up again first (the tab was in the background), then play
  startRebuffer(REBUFFER_AHEAD, true);
  if (!rb) videoEl.play().catch(() => {});
}

// "Join Telegram": keep the video PAUSED while the viewer is away
supportJoinBtn.addEventListener('click', () => {
  awaitingReturn = true;
  supportMsg.textContent = 'Join the channel, then come back to this tab. Your video continues from where you stopped.';
  supportContinueBtn.hidden = false;
});

// viewer came back to the tab -> resume automatically
document.addEventListener('visibilitychange', () => {
  if (!awaitingReturn) return;
  if (document.visibilityState === 'hidden') leftPage = true;
  else if (leftPage) resumeAfterSupport();
});
window.addEventListener('blur', () => {
  if (awaitingReturn) leftPage = true;
});
window.addEventListener('focus', () => {
  if (awaitingReturn && leftPage) resumeAfterSupport();
});

supportContinueBtn.addEventListener('click', resumeAfterSupport);
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
   Custom player
   - 5s skip buttons on the video, no free seeking
   - smart buffering: never plays until a few seconds are ready ahead
   - quality levels (Original / 720p / 480p / 360p) with auto-downgrade
   - fullscreen + landscape (with a rotate fallback for iPhone)
   ===================================================================== */

const REBUFFER_AHEAD = 30;  // seconds that must be buffered before resuming after a real stall / low buffer
const MIN_FILL_RATE = 1.2;  // media-seconds fetched per real second; below this the connection can't keep up
const MAX_AHEAD = 50;       // when the connection is slow and there is no lower quality: buffer this much before playing
const LOW_WATER = 6;        // playing with less than this many seconds buffered ahead -> pause early and refill
const POS_SAVE_EVERY = 3000; // ms between saving the watch position

const qualityWrap = document.getElementById('qualityWrap');
const qualityBtn = document.getElementById('qualityBtn');
const qualityLabel = document.getElementById('qualityLabel');
const qualityMenu = document.getElementById('qualityMenu');
const bufferText = document.getElementById('bufferText');
const toastEl = document.getElementById('playerToast');

let sources = [];
let currentSource = null;
let qualityCap = null;      // set when we auto-downgrade, so the next video starts low too
let rb = null;              // active "buffer before playing" state
let stallTimes = [];
let pauseBufferWorks = true; // false if this browser doesn't keep downloading while paused (then we just let it play)
let lastRbEnd = 0;
let currentItemId = null;
let lastPosSave = 0;
let bigBuffer = false;      // slow connection + no lower quality: use the big buffer target from now on
let lastGoodTime = 0;       // last position reached by normal playback / allowed skips
let skipping = false;       // true while OUR code is seeking (skip buttons, quality switch)
let idleTimer = null;
let toastTimer = null;
let tapWasIdle = false;
let lockedLandscape = false;

/* ---------- helpers ---------- */

function fmtTime(t) {
  if (!isFinite(t) || t < 0) t = 0;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const ss = String(Math.floor(t % 60)).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

function showSpinner(on) {
  spinnerEl.classList.toggle('show', on);
  if (!on) bufferText.classList.remove('show');
}

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
}

function resetPlayerUi() {
  lastGoodTime = 0;
  skipping = false;
  stallTimes = [];
  bigBuffer = false;
  progressPlayed.style.width = '0%';
  progressBuffered.style.width = '0%';
  timeLabel.textContent = '0:00 / 0:00';
  stageEl.classList.remove('playing', 'idle');
  qualityMenu.hidden = true;
}

function updateProgress() {
  const dur = videoEl.duration;
  if (!isFinite(dur) || dur <= 0) return;
  progressPlayed.style.width = `${(videoEl.currentTime / dur) * 100}%`;
  timeLabel.textContent = `${fmtTime(videoEl.currentTime)} / ${fmtTime(dur)}`;
}

/* seconds of video already downloaded ahead of the playhead */
function aheadSeconds() {
  const t = videoEl.currentTime;
  const b = videoEl.buffered;
  for (let i = 0; i < b.length; i++) {
    if (b.start(i) <= t + 0.3 && b.end(i) >= t) return Math.max(0, b.end(i) - t);
  }
  return 0;
}

function updateBuffered() {
  const dur = videoEl.duration;
  if (!isFinite(dur) || dur <= 0) return;
  progressBuffered.style.width = `${Math.min(100, ((videoEl.currentTime + aheadSeconds()) / dur) * 100)}%`;
}

/* ---------- quality ---------- */

function isMobile() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 700;
}

function pickInitialSource() {
  if (sources.length === 1) return sources[0];

  // 1) the viewer's own choice always wins
  const pref = parseInt(localStorage.getItem('nox_qpref') || '', 10);
  if (pref) {
    const hit = sources.find((s) => s.height === pref);
    if (hit) return hit;
  }

  // 2) otherwise guess from the connection / device
  const c = navigator.connection || {};
  let targetH;
  if (c.saveData) targetH = 360;
  else if (c.downlink) targetH = c.downlink < 1.5 ? 360 : c.downlink < 3 ? 480 : c.downlink < 8 ? 720 : 9999;
  else targetH = isMobile() ? 480 : 720;

  if (qualityCap) targetH = Math.min(targetH, qualityCap);

  const ok = sources.filter((s) => s.height <= targetH); // sources are sorted high -> low
  return ok.length ? ok[0] : sources[sources.length - 1];
}

function buildQualityMenu() {
  qualityMenu.innerHTML = '';
  qualityWrap.hidden = sources.length < 2;
  sources.forEach((src) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.height = src.height;
    b.textContent = src.label;
    b.addEventListener('click', () => {
      qualityMenu.hidden = true;
      if (src === currentSource) return;
      localStorage.setItem('nox_qpref', String(src.height));
      switchSource(src, `Switched to ${src.label}`);
    });
    qualityMenu.appendChild(b);
  });
}

function updateQualityUi() {
  qualityLabel.textContent = currentSource ? currentSource.label : 'Auto';
  qualityMenu.querySelectorAll('button').forEach((b) => {
    b.classList.toggle('active', currentSource && Number(b.dataset.height) === currentSource.height);
  });
}

function loadSource(src, resumeAt, autoplay = true) {
  currentSource = src;
  updateQualityUi();
  showSpinner(true);

  lastGoodTime = resumeAt || 0;
  if (resumeAt > 0) skipping = true; // our own seek, let the seek guard through

  videoEl.src = src.url;
  if (resumeAt > 0) {
    const onMeta = () => {
      videoEl.removeEventListener('loadedmetadata', onMeta);
      videoEl.currentTime = resumeAt;
    };
    videoEl.addEventListener('loadedmetadata', onMeta);
  }

  startInstantPlay(autoplay);
}

/* play as soon as the browser has enough to start (no artificial pre-buffer wait).
   The browser keeps downloading ahead in the background on its own while it plays,
   so "aage ka buffer" builds up naturally within a few seconds without blocking start. */
function startInstantPlay(autoplay = true) {
  showSpinner(true);
  if (autoplay) stageEl.classList.add('playing');
  const onReady = () => {
    videoEl.removeEventListener('canplay', onReady);
    showSpinner(false);
    if (autoplay) videoEl.play().catch(() => stageEl.classList.remove('playing'));
  };
  if (videoEl.readyState >= 3) {
    onReady();
  } else {
    videoEl.addEventListener('canplay', onReady);
  }
}

function switchSource(src, message) {
  bigBuffer = false;
  const resumeAt = videoEl.currentTime;
  const wasPlaying = !videoEl.paused || !!rb;
  cancelRebuffer();
  if (message) toast(message);
  loadSource(src, resumeAt, wasPlaying); // stay paused if the user had paused before switching quality
}

function canDowngrade() {
  const i = sources.indexOf(currentSource);
  return i >= 0 && i < sources.length - 1;
}

function downgrade() {
  if (!canDowngrade()) return false;
  const next = sources[sources.indexOf(currentSource) + 1];
  qualityCap = next.height;
  switchSource(next, `Slow connection, switched to ${next.label}`);
  return true;
}

/* ---------- smart buffering ---------- */

function startRebuffer(target, resume) {
  if (rb) return;
  if (!pauseBufferWorks) {
    // this browser doesn't fetch while paused, so pausing only makes things worse
    if (resume && videoEl.paused) videoEl.play().catch(() => {});
    return;
  }
  if (!videoEl.paused) videoEl.pause();
  const now = performance.now();
  const a = aheadSeconds();
  rb = { target, resume, t0: now, ahead0: a, lastAhead: a, lastGrow: now, checked: false, timer: null };
  stageEl.classList.add('playing'); // show the pause icon: the user "is playing", we're just filling the buffer
  showSpinner(true);
  rb.timer = setInterval(tickRebuffer, 400);
  tickRebuffer();
}

function tickRebuffer() {
  if (!rb) return;
  const now = performance.now();
  const ahead = aheadSeconds();
  if (ahead > rb.lastAhead + 0.05) {
    rb.lastAhead = ahead;
    rb.lastGrow = now;
  }

  const dur = isFinite(videoEl.duration) ? videoEl.duration : Infinity;
  const need = Math.min(rb.target, Math.max(0.5, dur - videoEl.currentTime - 0.5));
  const pct = Math.min(100, Math.round((ahead / need) * 100));
  spinnerEl.classList.add('show');
  bufferText.textContent = `Buffering ${pct}%`;
  bufferText.classList.add('show');

  const elapsed = (now - rb.t0) / 1000;

  // connection filling the buffer slower than real time -> this quality will keep stalling
  if (!rb.checked && elapsed >= 4) {
    rb.checked = true;
    const rate = (ahead - rb.ahead0) / elapsed;
    if (rate < MIN_FILL_RATE) {
      if (canDowngrade()) {
        downgrade();
        return;
      }
      // nothing lower to switch to: wait for a much bigger buffer so the stops are rare and short-lived
      bigBuffer = true;
      rb.target = MAX_AHEAD;
      toast('Slow connection, loading extra so it plays smoothly');
    }
  }

  const maxWait = rb.target > 35 ? 90 : 40;
  // no new data for a while: normal for a browser that has hit its own buffer limit,
  // but wait longer if nothing has arrived at all yet (still connecting)
  const idleLimit = ahead < 0.5 ? 12000 : 3500;
  if (ahead >= need) {
    finishRebuffer(true);
  } else if (now - rb.lastGrow > idleLimit || elapsed > maxWait) {
    if (ahead >= 0.5 && ahead < 5) pauseBufferWorks = false; // it stopped buffering while paused
    finishRebuffer(true);
  }
}

function finishRebuffer(resume) {
  if (!rb) return;
  clearInterval(rb.timer);
  const wantPlay = resume && rb.resume;
  rb = null;
  lastRbEnd = performance.now();
  showSpinner(false);
  if (wantPlay) {
    videoEl.play().catch(() => stageEl.classList.remove('playing'));
  } else {
    stageEl.classList.remove('playing');
  }
}

function cancelRebuffer() {
  if (!rb) return;
  clearInterval(rb.timer);
  rb = null;
  lastRbEnd = performance.now();
  showSpinner(false);
}

/* buffer running low while playing: pause a bit early and refill to 30-50s instead of freezing */
function checkLowWater() {
  if (rb || !pauseBufferWorks || videoEl.paused || videoEl.seeking || skipping) return;
  const dur = videoEl.duration;
  if (!isFinite(dur) || videoEl.currentTime < 1) return;
  const ahead = aheadSeconds();
  const notNearEnd = dur - videoEl.currentTime > ahead + 1.5;
  if (ahead < LOW_WATER && notNearEnd && performance.now() - lastRbEnd > 15000) {
    startRebuffer(bigBuffer ? MAX_AHEAD : REBUFFER_AHEAD, true);
  }
}

/* a stall during normal playback: pause, refill the buffer, then continue */
videoEl.addEventListener('waiting', () => {
  if (!videoEl.src || rb || videoEl.seeking || skipping) return;
  if (videoEl.paused) return;

  const now = performance.now();
  stallTimes = stallTimes.filter((t) => now - t < 60000);
  stallTimes.push(now);
  if (stallTimes.length >= 3 && canDowngrade()) {
    stallTimes = [];
    downgrade();
    return;
  }
  startRebuffer(bigBuffer ? MAX_AHEAD : REBUFFER_AHEAD, true);
});

/* ---------- controls ---------- */

function togglePlay() {
  if (rb) {
    // user hit pause while we were buffering: stay paused
    cancelRebuffer();
    stageEl.classList.remove('playing');
    return;
  }
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
  wakeControls();
}

function wakeControls() {
  stageEl.classList.remove('idle');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => stageEl.classList.add('idle'), 3000);
}

/* ---------- fullscreen + landscape ---------- */

function fsElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

function applyRotation() {
  const active = stageEl.classList.contains('pseudo-fs') || fsElement() === stageEl;
  const portrait = window.innerHeight > window.innerWidth;
  stageEl.classList.toggle('rotated', active && portrait && !lockedLandscape);
}

async function enterFullscreen() {
  const req = stageEl.requestFullscreen || stageEl.webkitRequestFullscreen;
  if (req) {
    try {
      await req.call(stageEl);
      // Android Chrome: turn the phone screen to landscape by itself
      if (screen.orientation && screen.orientation.lock) {
        try {
          await screen.orientation.lock('landscape');
          lockedLandscape = true;
        } catch (e) {
          lockedLandscape = false;
        }
      }
      applyRotation();
      return;
    } catch (e) {
      /* fall through to pseudo fullscreen */
    }
  }
  // iPhone Safari (no element fullscreen): fill the screen ourselves, rotated if the phone is upright
  stageEl.classList.add('pseudo-fs');
  overlay.classList.add('pseudo-active');
  applyRotation();
}

function leaveFullscreen() {
  if (fsElement()) {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  }
  if (screen.orientation && screen.orientation.unlock) {
    try { screen.orientation.unlock(); } catch (e) { /* ignore */ }
  }
  lockedLandscape = false;
  stageEl.classList.remove('pseudo-fs', 'rotated');
  overlay.classList.remove('pseudo-active');
}

function toggleFullscreen() {
  if (fsElement() || stageEl.classList.contains('pseudo-fs')) leaveFullscreen();
  else enterFullscreen();
}

['fullscreenchange', 'webkitfullscreenchange'].forEach((ev) =>
  document.addEventListener(ev, () => {
    if (!fsElement()) {
      // user left fullscreen with Esc / system back
      if (screen.orientation && screen.orientation.unlock) {
        try { screen.orientation.unlock(); } catch (e) { /* ignore */ }
      }
      lockedLandscape = false;
      stageEl.classList.remove('rotated');
    }
    applyRotation();
  })
);
window.addEventListener('resize', applyRotation);
window.addEventListener('orientationchange', () => setTimeout(applyRotation, 200));

/* ---------- events ---------- */

playPauseBtn.addEventListener('click', togglePlay);
back5Btn.addEventListener('click', () => skipBy(-SKIP_SECONDS));
fwd5Btn.addEventListener('click', () => skipBy(SKIP_SECONDS));
fsBtn.addEventListener('click', toggleFullscreen);
muteBtn.addEventListener('click', () => {
  videoEl.muted = !videoEl.muted;
});
qualityBtn.addEventListener('click', () => {
  qualityMenu.hidden = !qualityMenu.hidden;
});

// touch: first tap only reveals the controls, next tap plays / pauses
stageEl.addEventListener(
  'pointerdown',
  (e) => {
    tapWasIdle = e.pointerType === 'touch' && stageEl.classList.contains('idle');
    if (!e.target.closest('.quality-wrap')) qualityMenu.hidden = true;
    wakeControls();
  },
  true
);
videoEl.addEventListener('click', () => {
  if (tapWasIdle) {
    tapWasIdle = false;
    return;
  }
  togglePlay();
  wakeControls();
});
videoEl.addEventListener('dblclick', toggleFullscreen);
stageEl.addEventListener('mousemove', wakeControls);

videoEl.addEventListener('play', () => stageEl.classList.add('playing'));
videoEl.addEventListener('pause', () => {
  if (rb) return; // internal pause while buffering
  stageEl.classList.remove('playing', 'idle');
});
videoEl.addEventListener('ended', () => {
  stageEl.classList.remove('playing', 'idle');
  lastGoodTime = 0; // so replay (auto-seek to 0) isn't blocked by the seek guard
  forgetPosition();
});
videoEl.addEventListener('volumechange', () => {
  stageEl.classList.toggle('is-muted', videoEl.muted || videoEl.volume === 0);
});

videoEl.addEventListener('loadedmetadata', updateProgress);
videoEl.addEventListener('timeupdate', () => {
  if (!videoEl.seeking) lastGoodTime = videoEl.currentTime;
  updateProgress();
  updateBuffered();
  checkLowWater();
  const now = Date.now();
  if (now - lastPosSave > POS_SAVE_EVERY) {
    lastPosSave = now;
    savePosition();
  }
});
videoEl.addEventListener('progress', updateBuffered);

/* spinner for seeks / loads (stall handling itself is above) */
['seeking', 'loadstart'].forEach((ev) =>
  videoEl.addEventListener(ev, () => {
    if (videoEl.src && !videoEl.paused) showSpinner(true);
  })
);
['playing', 'seeked', 'error'].forEach((ev) =>
  videoEl.addEventListener(ev, () => {
    if (ev === 'seeked') skipping = false;
    if (!rb) showSpinner(false);
  })
);

/* safety net: any seek that did not come from our own code and jumps
   further than 5s (native iPhone controls, media keys, etc.) is undone */
videoEl.addEventListener('seeking', () => {
  if (skipping) return;
  if (Math.abs(videoEl.currentTime - lastGoodTime) > SKIP_SECONDS + 0.75) {
    videoEl.currentTime = lastGoodTime;
  }
});

/* ---------- remember where the viewer stopped ---------- */

function posKey(id) {
  return `nox_pos_${id}`;
}

function savePosition() {
  if (!currentItemId || !isFinite(videoEl.duration) || videoEl.currentTime < 5) return;
  try {
    localStorage.setItem(posKey(currentItemId), JSON.stringify({ t: videoEl.currentTime, d: videoEl.duration }));
  } catch (e) { /* storage full / blocked: ignore */ }
}

function forgetPosition() {
  if (!currentItemId) return;
  try { localStorage.removeItem(posKey(currentItemId)); } catch (e) { /* ignore */ }
}

function getSavedPosition(id) {
  try {
    const v = JSON.parse(localStorage.getItem(posKey(id)) || 'null');
    if (v && v.t > 10 && (!v.d || v.t < v.d - 20)) return v.t;
  } catch (e) { /* ignore */ }
  return 0;
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') savePosition();
});
window.addEventListener('pagehide', savePosition);

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
      break;
    case 'ArrowLeft':
      e.preventDefault();
      skipBy(-SKIP_SECONDS);
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
