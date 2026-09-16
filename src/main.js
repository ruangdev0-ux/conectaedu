import './style.css';

const STORAGE_KEY = 'worldtime-zones';
const DEFAULT_ZONES = [
  { id: 'local', city: 'Local time', zone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { id: 'new-york', city: 'New York', zone: 'America/New_York' },
  { id: 'london', city: 'London', zone: 'Europe/London' },
  { id: 'tokyo', city: 'Tokyo', zone: 'Asia/Tokyo' },
];
const AVAILABLE_ZONES = [
  ['los-angeles', 'Los Angeles', 'America/Los_Angeles'],
  ['sao-paulo', 'São Paulo', 'America/Sao_Paulo'],
  ['mexico-city', 'Mexico City', 'America/Mexico_City'],
  ['paris', 'Paris', 'Europe/Paris'],
  ['dubai', 'Dubai', 'Asia/Dubai'],
  ['singapore', 'Singapore', 'Asia/Singapore'],
  ['sydney', 'Sydney', 'Australia/Sydney'],
];

const clockList = document.getElementById('clock-list');
const status = document.getElementById('clock-status');
let zones = loadZones();

function loadZones() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) && saved.length ? saved : DEFAULT_ZONES;
  } catch {
    return DEFAULT_ZONES;
  }
}

function saveZones() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
}

function formatTime(now, zone) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);
}

function formatDate(now, zone) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(now);
}

function formatZoneName(zone) {
  return new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'long' })
    .formatToParts(new Date()).find((part) => part.type === 'timeZoneName')?.value || zone;
}

function render(now = new Date()) {
  clockList.innerHTML = zones.map((item, index) => `
    <article class="clock-card ${index === 0 ? 'clock-card--featured' : ''}" data-id="${item.id}">
      <div class="clock-card__top">
        <div>
          <p class="city">${item.city}${index === 0 ? ' <span class="you">YOU ARE HERE</span>' : ''}</p>
          <p class="zone">${formatZoneName(item.zone)}</p>
        </div>
        ${index > 0 ? `<button class="remove-button" type="button" data-remove="${item.id}" aria-label="Remove ${item.city}">×</button>` : ''}
      </div>
      <time class="time" datetime="${now.toISOString()}">${formatTime(now, item.zone)}</time>
      <p class="date">${formatDate(now, item.zone)}</p>
    </article>
  `).join('');
}

function addTimezone() {
  const existing = new Set(zones.map(({ id }) => id));
  const next = AVAILABLE_ZONES.find(([id]) => !existing.has(id));
  if (!next) {
    status.textContent = 'All available time zones are already displayed.';
    return;
  }
  const [id, city, zone] = next;
  zones.push({ id, city, zone });
  saveZones();
  status.textContent = `${city} added.`;
  render();
}

document.getElementById('add-clock').addEventListener('click', addTimezone);
clockList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  zones = zones.filter(({ id }) => id !== button.dataset.remove);
  saveZones();
  status.textContent = 'Time zone removed.';
  render();
});

render();
setInterval(() => render(), 1000);
