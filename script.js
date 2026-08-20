// Backend ka address -- deploy karne ke baad ise apne live API URL se replace karein
// e.g. const API_URL = 'https://api.yourdomain.dpdns.org';
const API_URL = 'https://backend-wkw9.onrender.com';

const backendSub = document.getElementById('backendSub');
const packet = document.getElementById('packet');
const messagesEl = document.getElementById('messages');
const countEl = document.getElementById('count');
const form = document.getElementById('msgForm');

function firePacket(direction) {
  packet.classList.remove('fire', 'back');
  void packet.offsetWidth; // reflow, taaki animation dobara chal sake
  packet.classList.add(direction === 'back' ? 'back' : 'fire');
}

async function init() {
  try {
    firePacket('fire');
    const health = await (await fetch(`${API_URL}/api/health`)).json();
    firePacket('back');
    backendSub.textContent = health.runtime;
    backendSub.classList.add('ok');
    await loadMessages();
  } catch (err) {
    backendSub.textContent = 'not connected';
    backendSub.classList.add('err');
    messagesEl.innerHTML = '<p class="hint">Backend start karein: cd backend && npm install && npm start</p>';
  }
}

async function loadMessages() {
  const res = await fetch(`${API_URL}/api/messages`);
  renderMessages(await res.json());
}

function renderMessages(list) {
  countEl.textContent = `(${list.length})`;
  messagesEl.innerHTML = list.map(m => `
    <div class="message">
      <strong>${escapeHtml(m.name)}</strong>
      <p>${escapeHtml(m.message)}</p>
      <time>${new Date(m.time).toLocaleString()}</time>
    </div>
  `).join('');
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('nameInput').value.trim();
  const message = document.getElementById('msgInput').value.trim();

  firePacket('fire');
  const res = await fetch(`${API_URL}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, message })
  });
  firePacket('back');
  renderMessages(await res.json());
  form.reset();
});

init();
