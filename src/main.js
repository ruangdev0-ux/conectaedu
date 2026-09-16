import './style.css';

const API = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING = 'https://geocoding-api.open-meteo.com/v1/search';
const weatherCodes = { 0:['☀','Clear sky'],1:['🌤','Mainly clear'],2:['⛅','Partly cloudy'],3:['☁','Overcast'],45:['🌫','Foggy'],48:['🌫','Rime fog'],51:['🌦','Light drizzle'],53:['🌦','Drizzle'],55:['🌧','Heavy drizzle'],61:['🌦','Light rain'],63:['🌧','Rain'],65:['🌧','Heavy rain'],71:['🌨','Light snow'],73:['❄','Snow'],75:['❄','Heavy snow'],80:['🌦','Rain showers'],81:['🌧','Rain showers'],82:['⛈','Heavy showers'],95:['⛈','Thunderstorm'],96:['⛈','Thunderstorm'],99:['⛈','Thunderstorm'] };
const $ = (id) => document.getElementById(id);
const setText = (id, value) => { $(id).textContent = value; };

async function findCity(name) {
  const response = await fetch(`${GEOCODING}?name=${encodeURIComponent(name)}&count=1&language=en&format=json`);
  if (!response.ok) throw new Error('Could not search for that city.');
  const data = await response.json();
  if (!data.results?.length) throw new Error('City not found. Try another search.');
  return data.results[0];
}
async function getWeather(place) {
  const params = new URLSearchParams({ latitude:place.latitude, longitude:place.longitude, timezone:'auto', forecast_days:7, current:'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m', daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' });
  const response = await fetch(`${API}?${params}`);
  if (!response.ok) throw new Error('Weather data is temporarily unavailable.');
  return response.json();
}
function icon(code) { return weatherCodes[code] || ['☁','Unknown conditions']; }
function dayName(date, index) { return index === 0 ? 'Today' : new Date(`${date}T12:00:00`).toLocaleDateString('en-US',{weekday:'short'}); }
function render(place, data) {
  const current = data.current, daily = data.daily, condition = icon(current.weather_code);
  $('weather-content').hidden = false; setText('location-name', `${place.name}${place.country_code ? `, ${place.country_code}` : ''}`); setText('updated-at', `Updated ${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`); setText('local-time', new Date().toLocaleString([], {weekday:'long', hour:'2-digit', minute:'2-digit'}));
  $('current-icon').textContent = condition[0]; setText('current-temp', Math.round(current.temperature_2m)); setText('current-summary', condition[1]); setText('today-high', Math.round(daily.temperature_2m_max[0])); setText('today-low', Math.round(daily.temperature_2m_min[0])); setText('humidity', `${current.relative_humidity_2m}%`); setText('wind', `${Math.round(current.wind_speed_10m)} km/h`); setText('feels-like', `${Math.round(current.apparent_temperature)}°`); setText('rain-chance', `${daily.precipitation_probability_max[0]}%`);
  $('forecast').innerHTML = daily.time.map((date, i) => { const c=icon(daily.weather_code[i]); return `<div class="forecast-day ${i===0?'today':''}"><span class="day">${dayName(date,i)}</span><span class="icon" aria-hidden="true">${c[0]}</span><strong>${Math.round(daily.temperature_2m_max[i])}° <span class="low">${Math.round(daily.temperature_2m_min[i])}°</span></strong><small>${c[1]}</small></div>`; }).join('');
}
async function load(place) { $('status').textContent='Loading weather…'; try { render(place, await getWeather(place)); $('status').textContent=''; } catch(error) { $('status').textContent=error.message; } }
$('search-form').addEventListener('submit', async (event) => { event.preventDefault(); const city=$('city-input').value.trim(); if (!city) return; try { await load(await findCity(city)); } catch(error) { $('status').textContent=error.message; } });
$('location-button').addEventListener('click', () => { if (!navigator.geolocation) { $('status').textContent='Geolocation is not supported by this browser.'; return; } $('status').textContent='Finding your location…'; navigator.geolocation.getCurrentPosition(async ({coords}) => { await load({latitude:coords.latitude, longitude:coords.longitude, name:'Your location'}); }, () => { $('status').textContent='Unable to access your location. Search for a city instead.'; }); });
load({ name:'London', latitude:51.5072, longitude:-0.1276 });
