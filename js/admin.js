const loginPanel = document.getElementById('loginPanel');
const adminPanel = document.getElementById('adminPanel');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

const addForm = document.getElementById('addForm');
const formMessage = document.getElementById('formMessage');
const episodeList = document.getElementById('episodeList');

const categoryForm = document.getElementById('categoryForm');
const categoryMessage = document.getElementById('categoryMessage');
const categoryList = document.getElementById('categoryList');
const categorySelect = document.getElementById('category');

let categories = []; // [{ key, label, icon }], newest first (same order as the homepage)

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
  await loadCategories();
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

// ---------- categories ----------

function authHeaders(json) {
  const h = { 'x-admin-password': getPassword() };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

function categoryLabel(key) {
  const c = categories.find((x) => x.key === key);
  return c ? c.label : key;
}

async function loadCategories() {
  const res = await fetch('/api/admin/categories', { headers: authHeaders() });
  if (!res.ok) return;
  categories = await res.json();
  renderCategories();
}

function renderCategories() {
  // dropdown in the "Add episode" form
  const current = categorySelect.value;
  categorySelect.innerHTML = '';
  categories.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.key;
    opt.textContent = `${c.icon || ''} ${c.label}`.trim();
    categorySelect.appendChild(opt);
  });
  if (categories.some((c) => c.key === current)) categorySelect.value = current;

  // chips list (top to bottom = same order as the homepage)
  categoryList.innerHTML = '';
  categories.forEach((c) => {
    const chip = document.createElement('div');
    chip.className = 'category-chip';
    chip.innerHTML = `<span>${escapeHtml(c.icon || '')} ${escapeHtml(c.label)}</span>`;
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'chip-del';
    del.setAttribute('aria-label', `Delete category ${c.label}`);
    del.textContent = '×';
    del.addEventListener('click', () => deleteCategory(c));
    chip.appendChild(del);
    categoryList.appendChild(chip);
  });
}

categoryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  categoryMessage.textContent = '';
  categoryMessage.className = 'form-message';

  const label = document.getElementById('newCategoryLabel').value.trim();
  const icon = document.getElementById('newCategoryEmoji').value.trim();

  const res = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ label, icon }),
  });

  if (res.ok) {
    categoryMessage.textContent = 'Category added. It is now at the top of the homepage.';
    categoryForm.reset();
    await loadCategories();
    refreshEpisodeList();
  } else {
    const data = await res.json().catch(() => ({}));
    categoryMessage.textContent = data.error || 'Could not add category.';
    categoryMessage.className = 'form-message error';
  }
});

async function deleteCategory(c) {
  if (!confirm(`Delete the category "${c.label}"?`)) return;
  categoryMessage.textContent = '';
  categoryMessage.className = 'form-message';

  const res = await fetch(`/api/admin/categories?key=${encodeURIComponent(c.key)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (res.ok) {
    await loadCategories();
    refreshEpisodeList();
  } else {
    const data = await res.json().catch(() => ({}));
    categoryMessage.textContent = data.error || 'Could not delete category.';
    categoryMessage.className = 'form-message error';
  }
}

async function changeCategory(ep, newKey, selectEl) {
  const res = await fetch(`/api/admin/videos/${ep.id}`, {
    method: 'PUT',
    headers: authHeaders(true),
    body: JSON.stringify({ category: newKey }),
  });
  if (res.ok) {
    ep.category = newKey;
  } else {
    selectEl.value = ep.category; // put it back if the save failed
    alert('Could not change the category. Try again.');
  }
}

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
    qualities: {
      720: document.getElementById('q720').value.trim(),
      480: document.getElementById('q480').value.trim(),
      360: document.getElementById('q360').value.trim(),
    },
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
    const q = ep.qualities || {};
    const have = [720, 480, 360].filter((h) => q[h]).map((h) => h + 'p');
    const row = document.createElement('div');
    row.className = 'episode-row';
    row.innerHTML = `
      <div class="info">
        <h4>${escapeHtml(ep.title)}</h4>
        <span>${have.length ? 'also: ' + have.join(', ') : 'original only'}</span>
      </div>
      <div class="row-actions">
        <select class="cat-select" aria-label="Category"></select>
        <button class="del-btn q-btn" type="button">Qualities</button>
        <button class="del-btn" data-id="${ep.id}" type="button">Delete</button>
      </div>
    `;
    const sel = row.querySelector('.cat-select');
    categories.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.key;
      opt.textContent = `${c.icon || ''} ${c.label}`.trim();
      sel.appendChild(opt);
    });
    // episode belongs to a category that no longer exists: still show it, don't hide it
    if (!categories.some((c) => c.key === ep.category)) {
      const opt = document.createElement('option');
      opt.value = ep.category;
      opt.textContent = ep.category + ' (missing)';
      sel.appendChild(opt);
    }
    sel.value = ep.category;
    sel.addEventListener('change', () => changeCategory(ep, sel.value, sel));
    row.querySelector('.q-btn').addEventListener('click', () => editQualities(ep));
    row.querySelector('[data-id]').addEventListener('click', () => deleteEpisode(ep.id));
    episodeList.appendChild(row);
  });
}

// quick editor: asks for the 720 / 480 / 360 object keys (leave blank to remove)
async function editQualities(ep) {
  const q = ep.qualities || {};
  const next = {};
  for (const h of [720, 480, 360]) {
    const v = prompt(`${h}p object key for "${ep.title}" (blank = none)`, q[h] || '');
    if (v === null) return; // cancelled
    next[h] = v.trim();
  }
  await fetch(`/api/admin/videos/${ep.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': getPassword() },
    body: JSON.stringify({ qualities: next }),
  });
  refreshEpisodeList();
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
