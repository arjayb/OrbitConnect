// OrbitConnect — Unified Developer Profile Aggregator
// Vanilla JS. Reads public data from the GitHub REST API and the npm
// registry search API. No backend, no login, no data is stored anywhere.

const form = document.getElementById('lookup-form');
const ghInput = document.getElementById('gh-input');
const npmInput = document.getElementById('npm-input');
const btn = document.getElementById('stamp-btn');
const status = document.getElementById('status-line');
const passport = document.getElementById('passport');
const passportPhoto = document.getElementById('passport-photo');
const passportName = document.getElementById('passport-name');
const passportBio = document.getElementById('passport-bio');
const passportSince = document.getElementById('passport-since');
const stampsEl = document.getElementById('stamps');
const ledgerEl = document.getElementById('ledger');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  run(ghInput.value.trim(), npmInput.value.trim());
});

async function run(ghUser, npmUser) {
  if (!ghUser) {
    setStatus('A GitHub username is required to start the passport.', true);
    return;
  }
  const npmName = npmUser || ghUser;

  setBusy(true);
  setStatus(`Building a passport for ${ghUser}…`, false);
  passport.classList.add('hidden');

  const [gh, npm] = await Promise.allSettled([
    fetchGitHub(ghUser),
    fetchNpm(npmName),
  ]);

  const ghData = gh.status === 'fulfilled' ? gh.value : null;

  if (!ghData) {
    setStatus(`No GitHub user named "${ghUser}" was found.`, true);
    setBusy(false);
    return;
  }

  const npmData = npm.status === 'fulfilled' ? npm.value : { found: false, count: 0 };

  renderPassport(ghData, npmData);
  setStatus(`Passport built for ${ghUser}.`, false);
  setBusy(false);
}

async function fetchGitHub(username) {
  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
  if (!res.ok) return null;
  const user = await res.json();

  const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100`);
  const repos = reposRes.ok ? await reposRes.json() : [];
  const totalStars = Array.isArray(repos) ? repos.reduce((s, r) => s + (r.stargazers_count || 0), 0) : 0;

  return { user, repoCount: Array.isArray(repos) ? repos.length : user.public_repos, totalStars };
}

async function fetchNpm(username) {
  const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=maintainer:${encodeURIComponent(username)}&size=50`);
  if (!res.ok) return { found: false, count: 0 };
  const data = await res.json();
  const count = data.total || 0;
  return { found: count > 0, count };
}

function setBusy(busy) {
  btn.disabled = busy;
  ghInput.disabled = busy;
  npmInput.disabled = busy;
}

function setStatus(msg, isError) {
  status.textContent = msg;
  status.classList.toggle('error', !!isError);
}

function renderPassport(gh, npm) {
  const { user, repoCount, totalStars } = gh;

  passportPhoto.style.backgroundImage = `url(${user.avatar_url})`;
  passportName.textContent = user.name || user.login;
  passportBio.textContent = user.bio || `@${user.login}`;
  passportSince.textContent = `member since ${new Date(user.created_at).getFullYear()}`;

  stampsEl.innerHTML = '';
  stampsEl.appendChild(buildStamp('GitHub', true, `${repoCount} repos`));
  stampsEl.appendChild(buildStamp('npm', npm.found, npm.found ? `${npm.count} pkgs` : 'not found'));

  ledgerEl.innerHTML = '';
  addLedgerRow('Public repositories', repoCount);
  addLedgerRow('Total stars across repos', totalStars.toLocaleString());
  addLedgerRow('Followers', user.followers.toLocaleString());
  addLedgerRow('Following', user.following.toLocaleString());
  addLedgerRow('npm packages maintained', npm.count);
  if (user.blog) addLedgerRow('Website', user.blog);
  if (user.location) addLedgerRow('Location', user.location);

  passport.classList.remove('hidden');
}

function buildStamp(label, found, sub) {
  const div = document.createElement('div');
  div.className = `stamp ${found ? 'found' : 'missing'}`;
  div.innerHTML = `<b>${label}</b><span>${found ? sub : 'not found'}</span>`;
  return div;
}

function addLedgerRow(k, v) {
  const row = document.createElement('div');
  row.className = 'ledger-row';
  row.innerHTML = `<span class="k">${escapeHtml(k)}</span><span class="v">${escapeHtml(String(v))}</span>`;
  ledgerEl.appendChild(row);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
