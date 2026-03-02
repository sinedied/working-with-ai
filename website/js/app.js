import { questions, computeScore, getScoreLabel } from './questions.js';
import { occupations } from './occupations.js';

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
  currentScreen: 'landing', // landing | question | result
  questionIndex: 0,
  answers: new Array(questions.length).fill(null),
  score: null,
  transitioning: false
};

// ─── DOM References ──────────────────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const screens = {
  landing: $('#landing-screen'),
  question: $('#question-screen'),
  result: $('#result-screen')
};

// ─── Initialization ──────────────────────────────────────────────────────────
export function init() {
  // Restore saved progress
  loadProgress();

  // Landing CTA
  $('#start-btn').addEventListener('click', () => {
    showScreen('question');
  });

  // Navigation buttons
  $('#next-btn').addEventListener('click', goNext);
  $('#back-btn').addEventListener('click', goBack);

  // Restart button
  $('#restart-btn').addEventListener('click', restart);

  // Occupation search
  $('#occupation-search').addEventListener('input', (e) => {
    filterOccupations(e.target.value);
  });

  // Toggle occupation explorer
  $('#toggle-explorer').addEventListener('click', () => {
    const explorer = $('#occupation-explorer');
    const btn = $('#toggle-explorer');
    explorer.classList.toggle('open');
    btn.textContent = explorer.classList.contains('open')
      ? 'Hide all occupations'
      : 'Browse all 787 occupations';
  });

  // Keyboard navigation
  document.addEventListener('keydown', handleKeyboard);

  // Render initial state
  renderQuestion();
  populateOccupations();
}

// ─── Screen Transitions ─────────────────────────────────────────────────────
function showScreen(name) {
  if (state.transitioning) return;
  state.transitioning = true;

  const current = screens[state.currentScreen];
  const next = screens[name];

  current.classList.add('screen-exit');
  current.classList.remove('screen-active');

  setTimeout(() => {
    current.classList.remove('screen-exit');
    current.classList.add('screen-hidden');
    next.classList.remove('screen-hidden');
    next.classList.add('screen-enter');

    requestAnimationFrame(() => {
      next.classList.remove('screen-enter');
      next.classList.add('screen-active');
      state.currentScreen = name;
      state.transitioning = false;

      if (name === 'result') {
        animateResult();
      }
    });
  }, 400);
}

// ─── Question Rendering ─────────────────────────────────────────────────────
function renderQuestion() {
  const q = questions[state.questionIndex];

  // Update progress
  $('#progress-fill').style.width = `${((state.questionIndex) / questions.length) * 100}%`;
  $('#progress-text').textContent = `${state.questionIndex + 1} / ${questions.length}`;

  // Question content
  $('#question-number').textContent = `Question ${state.questionIndex + 1}`;
  $('#question-text').textContent = q.text;
  $('#question-hint').textContent = q.hint;

  // Options
  const optionsContainer = $('#options-container');
  optionsContainer.innerHTML = '';

  q.options.forEach((option, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.dataset.value = i;
    if (state.answers[state.questionIndex] === i) {
      btn.classList.add('selected');
    }
    btn.innerHTML = `<span class="option-marker">${String.fromCharCode(65 + i)}</span><span class="option-text">${option}</span>`;
    btn.addEventListener('click', () => selectOption(i));
    optionsContainer.appendChild(btn);
  });

  // Navigation state
  $('#back-btn').style.visibility = state.questionIndex === 0 ? 'hidden' : 'visible';

  const isLast = state.questionIndex === questions.length - 1;
  const nextBtn = $('#next-btn');
  nextBtn.textContent = isLast ? 'See Results' : 'Next';
  nextBtn.disabled = state.answers[state.questionIndex] === null;

  // Animate options in with stagger
  const options = optionsContainer.querySelectorAll('.option-btn');
  options.forEach((opt, i) => {
    opt.style.animationDelay = `${i * 0.06}s`;
    opt.classList.add('option-enter');
  });
}

function selectOption(value) {
  state.answers[state.questionIndex] = value;
  saveProgress();

  // Update UI
  $$('.option-btn').forEach(btn => {
    btn.classList.toggle('selected', parseInt(btn.dataset.value) === value);
  });

  $('#next-btn').disabled = false;

  // Auto-advance after short delay (unless last question)
  if (state.questionIndex < questions.length - 1) {
    setTimeout(() => goNext(), 350);
  }
}

// ─── Navigation ──────────────────────────────────────────────────────────────
function goNext() {
  if (state.answers[state.questionIndex] === null) return;
  if (state.transitioning) return;

  if (state.questionIndex < questions.length - 1) {
    transitionQuestion(1);
  } else {
    // Calculate score and show result
    state.score = computeScore(state.answers);
    showScreen('result');
  }
}

function goBack() {
  if (state.questionIndex > 0 && !state.transitioning) {
    transitionQuestion(-1);
  }
}

function transitionQuestion(direction) {
  state.transitioning = true;
  const container = $('#question-content');

  container.classList.add(direction > 0 ? 'slide-out-left' : 'slide-out-right');

  setTimeout(() => {
    state.questionIndex += direction;
    renderQuestion();
    container.classList.remove('slide-out-left', 'slide-out-right');
    container.classList.add(direction > 0 ? 'slide-in-right' : 'slide-in-left');

    setTimeout(() => {
      container.classList.remove('slide-in-right', 'slide-in-left');
      state.transitioning = false;
    }, 350);
  }, 300);
}

// ─── Result Screen ───────────────────────────────────────────────────────────
function animateResult() {
  const score = state.score;
  const percentage = Math.round(score * 200); // 0-100 display scale (0.5 max → 100)
  const labelInfo = getScoreLabel(score);

  // Animate gauge
  const gauge = $('#score-gauge');
  const scoreValue = $('#score-value');
  const scoreLabel = $('#score-label');
  const scoreDesc = $('#score-description');

  // Set final state on the gauge
  const angle = (percentage / 100) * 360;
  gauge.style.setProperty('--score-angle', `${angle}deg`);
  gauge.style.setProperty('--score-color', getScoreColor(percentage));

  // Animate counter
  let current = 0;
  const duration = 1800;
  const startTime = performance.now();

  function animateCounter(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    current = Math.round(eased * percentage);

    scoreValue.textContent = current;
    gauge.style.setProperty('--current-angle', `${(current / 100) * 360}deg`);

    if (progress < 1) {
      requestAnimationFrame(animateCounter);
    } else {
      // Show label and description
      scoreLabel.textContent = labelInfo.label;
      scoreLabel.classList.add('visible');
      scoreDesc.textContent = labelInfo.description;
      scoreDesc.classList.add('visible');

      // Show similar occupations
      setTimeout(showSimilarOccupations, 400);
    }
  }

  // Start animation after a beat
  setTimeout(() => {
    gauge.classList.add('animating');
    requestAnimationFrame(animateCounter);
  }, 600);
}

function getScoreColor(percentage) {
  if (percentage < 20) return '#22d3ee'; // cyan
  if (percentage < 40) return '#06b6d4';
  if (percentage < 60) return '#8b5cf6'; // purple
  if (percentage < 80) return '#d946ef'; // magenta
  return '#f43f5e'; // rose
}

function showSimilarOccupations() {
  const container = $('#similar-occupations');
  container.innerHTML = '';

  // Find 5 closest occupations
  const sorted = [...occupations]
    .map(o => ({ ...o, diff: Math.abs(o.score - state.score) }))
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 5);

  sorted.forEach((occ, i) => {
    const card = document.createElement('div');
    card.className = 'occupation-card';
    card.style.animationDelay = `${i * 0.1}s`;

    const pct = Math.round(occ.score * 200);
    card.innerHTML = `
      <div class="occ-info">
        <span class="occ-title">${occ.title}</span>
        <span class="occ-soc">${occ.soc}</span>
      </div>
      <div class="occ-score">
        <div class="occ-bar-track">
          <div class="occ-bar-fill" style="width: ${pct}%; background: ${getScoreColor(pct)}"></div>
        </div>
        <span class="occ-pct">${pct}%</span>
      </div>
    `;
    container.appendChild(card);
  });

  $('#similar-section').classList.add('visible');
}

// ─── Occupation Explorer ─────────────────────────────────────────────────────
function populateOccupations() {
  renderOccupationList(occupations);
}

function filterOccupations(query) {
  const q = query.toLowerCase().trim();
  if (!q) {
    renderOccupationList(occupations);
    return;
  }

  const filtered = occupations.filter(o =>
    o.title.toLowerCase().includes(q) || o.soc.includes(q)
  );
  renderOccupationList(filtered);
}

function renderOccupationList(list) {
  const container = $('#occupation-list');
  // Virtual-ish rendering: only show first 50, expand on scroll
  const toShow = list.slice(0, 100);

  container.innerHTML = toShow.map(occ => {
    const pct = Math.round(occ.score * 200);
    return `
      <div class="occ-row">
        <span class="occ-row-title">${occ.title}</span>
        <div class="occ-row-bar">
          <div class="occ-row-fill" style="width: ${pct}%; background: ${getScoreColor(pct)}"></div>
        </div>
        <span class="occ-row-pct">${pct}%</span>
      </div>
    `;
  }).join('');

  if (list.length > 100) {
    container.insertAdjacentHTML('beforeend',
      `<div class="occ-row occ-more">Showing 100 of ${list.length} — type to filter</div>`
    );
  }
  if (list.length === 0) {
    container.innerHTML = '<div class="occ-row occ-empty">No occupations found</div>';
  }
}

// ─── Keyboard Navigation ────────────────────────────────────────────────────
function handleKeyboard(e) {
  if (state.currentScreen !== 'question') return;

  // Number keys 1-5 to select options
  const num = parseInt(e.key);
  if (num >= 1 && num <= 5) {
    selectOption(num - 1);
    return;
  }

  // A-E keys to select options
  const letter = e.key.toUpperCase();
  const letterIndex = letter.charCodeAt(0) - 65;
  if (letterIndex >= 0 && letterIndex < 5 && letter.length === 1) {
    selectOption(letterIndex);
    return;
  }

  // Arrow keys / Enter
  if (e.key === 'ArrowRight' || e.key === 'Enter') {
    goNext();
  } else if (e.key === 'ArrowLeft') {
    goBack();
  }
}

// ─── Persistence ─────────────────────────────────────────────────────────────
function saveProgress() {
  try {
    localStorage.setItem('wai-answers', JSON.stringify(state.answers));
    localStorage.setItem('wai-index', state.questionIndex.toString());
  } catch (e) { /* ignore */ }
}

function loadProgress() {
  try {
    const saved = localStorage.getItem('wai-answers');
    const idx = localStorage.getItem('wai-index');
    if (saved) {
      state.answers = JSON.parse(saved);
      state.questionIndex = parseInt(idx) || 0;
    }
  } catch (e) { /* ignore */ }
}

function restart() {
  state.answers = new Array(questions.length).fill(null);
  state.questionIndex = 0;
  state.score = null;
  try {
    localStorage.removeItem('wai-answers');
    localStorage.removeItem('wai-index');
  } catch (e) { /* ignore */ }

  // Reset UI
  $('#score-gauge').classList.remove('animating');
  $('#score-gauge').style.setProperty('--current-angle', '0deg');
  $('#score-label').classList.remove('visible');
  $('#score-description').classList.remove('visible');
  $('#similar-section').classList.remove('visible');
  $('#occupation-explorer').classList.remove('open');
  $('#toggle-explorer').textContent = 'Browse all 787 occupations';

  renderQuestion();
  showScreen('question');
}

// ─── Boot ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
