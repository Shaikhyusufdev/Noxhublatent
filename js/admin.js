const loginPanel = document.getElementById('loginPanel');
const adminPanel = document.getElementById('adminPanel');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

const addForm = document.getElementById('addForm');
const formMessage = document.getElementById('formMessage');
const episodeList = document.getElementById('episodeList');

function getPassword() {
  return sessionStorage.getItem('adminPassword') || '';
}

function setPassword(pw) {
  sessionStorage.setItem('adminPassword', pw);
}

async function tryLogin(password) {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return res.ok;
}

async function showAdminPanel() {
  loginPanel.hidden = true;
  adminPanel.hidden = false;
  await refreshEpisodeList();
}

loginBtn.addEventListener('click', async () => {
  const password = passwordInput.value;
  const ok = await tryLogin(password);
  if (ok) {
    setPassword(password);
    loginError.textContent = '';
    showAdminPanel();
  } else {
    loginError.textContent = 'Wrong password.';
  }
});

passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loginBtn.click();
});

// If a password is already remembered for this tab, verify it silently
(async () => {
  const remembered = getPassword();
  if (remembered) {
    const ok = await tryLogin(remembered);
    if (ok) showAdminPanel();
  }
})();

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMessage.textContent = '';
  formMessage.className = 'form-message';

  const payload = {
    title: document.getElementById('title').value.trim(),
    category: document.getElementById('category').value,
    videoKey: document.getElementById('videoKey').value.trim(),
    thumbnailUrl: document.getElementById('thumbnailUrl').value.trim(),
    description: document.getElementById('description').value.trim(),
  };

  const res = await fetch('/api/admin/videos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': getPassword(),
    },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    formMessage.textContent = 'Episode added.';
    addForm.reset();
    refreshEpisodeList();
  } else {
    const data = await res.json().catch(() => ({}));
    formMessage.textContent = data.error || 'Could not add episode.';
    formMessage.className = 'form-message error';
  }
});

async function refreshEpisodeList() {
  const res = await fetch('/api/admin/videos', {
    headers: { 'x-admin-password': getPassword() },
  });
  if (!res.ok) return;
  const episodes = await res.json();

  episodeList.innerHTML = '';
  if (episodes.length === 0) {
    episodeList.innerHTML = '<p class="form-message">No episodes yet.</p>';
    return;
  }

  episodes.forEach((ep) => {
    const row = document.createElement('div');
    row.className = 'episode-row';
    row.innerHTML = `
      <div class="info">
        <h4>${escapeHtml(ep.title)}</h4>
        <span>${escapeHtml(ep.category)}</span>
      </div>
      <button class="del-btn" data-id="${ep.id}">Delete</button>
    `;
    row.querySelector('.del-btn').addEventListener('click', () => deleteEpisode(ep.id));
    episodeList.appendChild(row);
  });
}

async function deleteEpisode(id) {
  if (!confirm('Delete this episode?')) return;
  await fetch(`/api/admin/videos/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-password': getPassword() },
  });
  refreshEpisodeList();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
