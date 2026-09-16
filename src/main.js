import './style.css';

const API_URL = 'https://v2.jokeapi.dev/joke/Any?type=single&safe-mode';
const jokeText = document.getElementById('joke-text');
const jokeCategory = document.getElementById('joke-category');
const jokeNumber = document.getElementById('joke-number');
const status = document.getElementById('status');
const newJokeButton = document.getElementById('new-joke');
const copyButton = document.getElementById('copy-joke');
let currentJoke = '';
let jokeCount = 0;

function setLoading(isLoading) {
  newJokeButton.disabled = isLoading;
  newJokeButton.classList.toggle('is-loading', isLoading);
  newJokeButton.innerHTML = isLoading
    ? '<span class="spinner" aria-hidden="true"></span> Finding a joke...'
    : '<span aria-hidden="true">↻</span> Tell me another';
}

async function fetchJoke() {
  setLoading(true);
  status.textContent = '';
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('The joke service is unavailable right now.');
    const data = await response.json();
    if (data.error || !data.joke) throw new Error('We could not find a joke this time.');

    currentJoke = data.joke;
    jokeCount += 1;
    jokeText.textContent = data.joke;
    jokeCategory.textContent = data.category || 'Any category';
    jokeNumber.textContent = `#${String(jokeCount).padStart(3, '0')}`;
    copyButton.disabled = false;
  } catch (error) {
    status.textContent = error.message || 'Something went wrong. Please try again.';
  } finally {
    setLoading(false);
  }
}

async function copyJoke() {
  if (!currentJoke) return;
  try {
    await navigator.clipboard.writeText(currentJoke);
    status.textContent = 'Joke copied to your clipboard.';
    copyButton.innerHTML = '<span aria-hidden="true">✓</span> Copied';
    window.setTimeout(() => {
      copyButton.innerHTML = '<span aria-hidden="true">▣</span> Copy joke';
    }, 1800);
  } catch {
    status.textContent = 'Could not copy the joke. Please select it manually.';
  }
}

newJokeButton.addEventListener('click', fetchJoke);
copyButton.addEventListener('click', copyJoke);
fetchJoke();
