/* =====================================================
   ALEX ACADEMY ECOSYSTEM — app.js
   Vanilla JS · No dependencies · localStorage only
   ===================================================== */

/* =====================================================
   APP DATA STRUCTURE & PERSISTENCE
   ===================================================== */
let APP = {
  user:    '',
  avatar:  '🎓',
  profile: { name: '', uni: '', major: '', semester: '1', nim: '', motto: '' },
  schedules: [],
  notes:   {},
  photos:  {},
  settings: {
    notif_class:   false,
    notif_morning: false,
    notif_night:   false,
    notif_study:   false,
    auto_theme:    false,
    morning_time:  '07:00',
    night_time:    '22:00',
    first_day:     1,
    star_intensity: 2,
    accent:  '#0ea5e9',
    accent2: '#06b6d4'
  },
  metrics: {
    focusSessions:   0,
    totalFocusMin:   0,
    streak:          0,
    lastSession:     null,
    sessionHistory:  []
  },
  mode: 'weekday'
};

function saveApp() {
  localStorage.setItem('aae_data', JSON.stringify(APP));
}

function loadApp() {
  const raw = localStorage.getItem('aae_data');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      APP = { ...APP, ...parsed };
      // Ensure nested defaults
      APP.settings = { ...{
        notif_class:false, notif_morning:false, notif_night:false, notif_study:false,
        auto_theme:false, morning_time:'07:00', night_time:'22:00',
        first_day:1, star_intensity:2, accent:'#0ea5e9', accent2:'#06b6d4'
      }, ...parsed.settings };
      APP.metrics = { ...{ focusSessions:0, totalFocusMin:0, streak:0, lastSession:null, sessionHistory:[] }, ...parsed.metrics };
    } catch (e) {
      console.warn('AAE: Failed to parse saved data', e);
    }
  }
}

/* =====================================================
   STARFIELD CANVAS
   ===================================================== */
const starCanvas = document.getElementById('starCanvas');
const sctx = starCanvas.getContext('2d');
let stars = [];
let starIntensityVal = 2;

function initStars() {
  starCanvas.width  = window.innerWidth;
  starCanvas.height = window.innerHeight;
  stars = [];
  const counts = [0, 80, 160, 250];
  const count = counts[Math.min(starIntensityVal, 3)];
  for (let i = 0; i < count; i++) {
    stars.push({
      x:     Math.random() * starCanvas.width,
      y:     Math.random() * starCanvas.height,
      r:     Math.random() * 1.8 + 0.2,
      speed: Math.random() * 0.3 + 0.05,
      phase: Math.random() * Math.PI * 2,
      big:   Math.random() > 0.85
    });
  }
}

function drawStars(ts) {
  sctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  const lightMode  = document.body.classList.contains('light-mode');
  const baseAlpha  = lightMode ? 0.3 : 1;

  for (const s of stars) {
    const alpha = (0.3 + 0.7 * ((Math.sin(s.phase + ts / 1200) + 1) / 2)) * baseAlpha;
    sctx.beginPath();
    sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    sctx.fillStyle = s.big
      ? `rgba(0,245,255,${alpha})`
      : `rgba(148,163,184,${alpha * 0.6})`;
    sctx.fill();
    s.y += s.speed;
    if (s.y > starCanvas.height) {
      s.y = 0;
      s.x = Math.random() * starCanvas.width;
    }
  }
  requestAnimationFrame(drawStars);
}

window.addEventListener('resize', initStars);

/* =====================================================
   LOADING SCREEN
   ===================================================== */
const BOOT_MESSAGES = [
  '▶ Initializing Academic Core...',
  '▶ Loading Schedule Matrix...',
  '▶ Synchronizing Temporal Engine...',
  '▶ Configuring Neural Interface...',
  '▶ Verifying Identity...',
  '▶ Launching Ecosystem...'
];

function runLoadingScreen() {
  const bootLog = document.getElementById('bootLog');
  const loadBar = document.getElementById('loadBar');

  bootLog.innerHTML = BOOT_MESSAGES
    .map(m => `<div class="boot-line">${m} <span class="boot-ok">[OK]</span></div>`)
    .join('');

  const lines = bootLog.querySelectorAll('.boot-line');
  lines.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('show');
      loadBar.style.width = ((i + 1) / lines.length * 100) + '%';
    }, i * 350 + 200);
  });

  setTimeout(() => {
    document.getElementById('loadingScreen').classList.add('fade-out');
    setTimeout(() => {
      document.getElementById('loadingScreen').style.display = 'none';
      checkLogin();
    }, 600);
  }, BOOT_MESSAGES.length * 350 + 800);
}

/* =====================================================
   LOGIN
   ===================================================== */
function checkLogin() {
  if (APP.user) {
    showApp();
  } else {
    const ls = document.getElementById('loginScreen');
    ls.style.display = 'flex';
  }
}

function doLogin() {
  const input = document.getElementById('nameInput');
  const val   = input.value.trim();
  if (!val) {
    input.classList.add('error');
    setTimeout(() => input.classList.remove('error'), 1500);
    return;
  }
  APP.user          = val;
  APP.profile.name  = val;
  saveApp();
  document.getElementById('loginScreen').style.display = 'none';
  showApp();
}

// Bind login events
document.getElementById('loginBtn').addEventListener('click', doLogin);
document.getElementById('nameInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') doLogin();
});

/* =====================================================
   SHOW APP (after login)
   ===================================================== */
function showApp() {
  const app = document.getElementById('app');
  app.style.display = 'flex';

  // Update UI with user data
  document.getElementById('welcomeName').textContent  = APP.user;
  document.getElementById('sidebarName').textContent  = APP.user;
  document.getElementById('sidebarAvatar').textContent = APP.avatar || '🎓';
  document.getElementById('profileAvatar').textContent = APP.avatar || '🎓';

  // Init all modules
  loadProfileFields();
  loadSettingsUI();
  loadSettingsState();
  renderDashboard();
  startClock();
  startCountdown();
  startQuoteRotation();
  initWeather();
  renderDaySelector();
  loadScheduleList();
  applyAccentFromSettings();

  // Request browser notification permission
  if ('Notification' in window) Notification.requestPermission();
}

/* =====================================================
   LIVE CLOCK
   ===================================================== */
const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function startClock() {
  function tick() {
    const now = new Date();
    const h   = String(now.getHours()).padStart(2, '0');
    const m   = String(now.getMinutes()).padStart(2, '0');
    const s   = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('headerClock').textContent = `${h}:${m}:${s}`;
    document.getElementById('headerDate').textContent  =
      `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;

    checkNotifications(now);

    // Auto theme
    if (APP.settings.auto_theme) {
      const hr          = now.getHours();
      const shouldLight = hr >= 6 && hr < 17;
      const isLight     = document.body.classList.contains('light-mode');
      if (shouldLight && !isLight) applyTheme(true);
      else if (!shouldLight && isLight) applyTheme(false);
    }
  }
  tick();
  setInterval(tick, 1000);
}

/* =====================================================
   NOTIFICATION CHECKER
   ===================================================== */
const lastNotifCheck = {};

function checkNotifications(now) {
  const hm  = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const key = `${now.toDateString()}_${hm}`;

  if (APP.settings.notif_morning && hm === APP.settings.morning_time && !lastNotifCheck['morning_' + key]) {
    lastNotifCheck['morning_' + key] = true;
    showToast('🌅', 'Good Morning!', `Rise and shine, ${APP.user}! Have a great day.`);
  }

  if (APP.settings.notif_night && hm === APP.settings.night_time && !lastNotifCheck['night_' + key]) {
    lastNotifCheck['night_' + key] = true;
    showToast('🌙', 'Time to Rest', 'Great work today! Get some quality sleep.');
  }

  if (APP.settings.notif_class) {
    const todayDay = now.getDay();
    const nowMin   = now.getHours() * 60 + now.getMinutes();
    APP.schedules
      .filter(s => s.day === todayDay)
      .forEach(s => {
        const [sh, sm] = s.start.split(':').map(Number);
        const startMin = sh * 60 + sm;
        const diff     = startMin - nowMin;
        const nKey     = `class_${s.id}_${key}`;
        if (diff === 60 && !lastNotifCheck[nKey]) {
          lastNotifCheck[nKey] = true;
          showToast('📅', 'Class Reminder', `${s.name} starts in 1 hour!`);
        }
      });
  }
}

/* =====================================================
   COUNTDOWN TO NEXT CLASS
   ===================================================== */
function startCountdown() {
  function update() {
    const now      = new Date();
    const todayDay = now.getDay();
    const nowMin   = now.getHours() * 60 + now.getMinutes();
    let next = null, minDiff = Infinity;

    APP.schedules.forEach(s => {
      const [sh, sm] = s.start.split(':').map(Number);
      if (s.day === todayDay) {
        const diff = sh * 60 + sm - nowMin;
        if (diff > 0 && diff < minDiff) { minDiff = diff; next = s; }
      }
    });

    // Search next 7 days if nothing today
    if (!next) {
      for (let d = 1; d <= 7; d++) {
        const nd = (todayDay + d) % 7;
        APP.schedules.filter(s => s.day === nd).forEach(s => {
          const [sh, sm] = s.start.split(':').map(Number);
          const diff     = d * 24 * 60 + sh * 60 + sm - nowMin;
          if (diff > 0 && diff < minDiff) { minDiff = diff; next = s; }
        });
        if (next) break;
      }
    }

    if (next) {
      const totalSec = minDiff * 60 - now.getSeconds();
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      document.getElementById('cdH').textContent = String(h).padStart(2, '0');
      document.getElementById('cdM').textContent = String(m).padStart(2, '0');
      document.getElementById('cdS').textContent = String(s).padStart(2, '0');
      document.getElementById('countdownCourse').textContent = `${next.name} · ${next.start}`;
    } else {
      document.getElementById('cdH').textContent = '—';
      document.getElementById('cdM').textContent = '—';
      document.getElementById('cdS').textContent = '—';
      document.getElementById('countdownCourse').textContent = 'No upcoming classes';
    }
  }
  update();
  setInterval(update, 1000);
}

/* =====================================================
   WEATHER (simulated presets)
   ===================================================== */
const WEATHER_PRESETS = [
  { icon:'⛅', temp:'28°C', desc:'Partly Cloudy',  h:'72%', w:'10 km/h' },
  { icon:'🌤', temp:'30°C', desc:'Mostly Sunny',   h:'65%', w:'8 km/h'  },
  { icon:'🌧', temp:'24°C', desc:'Light Rain',      h:'88%', w:'15 km/h' },
  { icon:'☀️', temp:'33°C', desc:'Hot & Sunny',    h:'60%', w:'6 km/h'  },
  { icon:'⛈', temp:'22°C', desc:'Thunderstorm',   h:'92%', w:'25 km/h' },
];

function initWeather() {
  const w = WEATHER_PRESETS[Math.floor(Math.random() * WEATHER_PRESETS.length)];
  document.getElementById('weatherIcon').textContent  = w.icon;
  document.getElementById('weatherTemp').textContent  = w.temp;
  document.getElementById('weatherDesc').textContent  = w.desc;
  document.getElementById('weatherMeta').textContent  = '📍 Your City';
  document.getElementById('weatherRight').innerHTML   =
    `<div>💧 ${w.h}</div><div>💨 ${w.w}</div><div>👁 10 km</div>`;
}

/* =====================================================
   MOTIVATIONAL QUOTES
   ===================================================== */
const QUOTES = [
  { text: 'Education is the most powerful weapon which you can use to change the world.',                               author: 'Nelson Mandela' },
  { text: 'The secret of getting ahead is getting started.',                                                            author: 'Mark Twain' },
  { text: 'Live as if you were to die tomorrow. Learn as if you were to live forever.',                                 author: 'Mahatma Gandhi' },
  { text: 'Intelligence plus character — that is the goal of true education.',                                          author: 'Martin Luther King Jr.' },
  { text: 'I have failed over and over again in my life — and that is why I succeed.',                                  author: 'Michael Jordan' },
  { text: 'The more that you read, the more things you will know. The more that you learn, the more places you\'ll go.',author: 'Dr. Seuss' },
  { text: 'Ilmu tanpa amal bagaikan pohon tanpa buah. Teruslah belajar dan bertindak.',                                 author: 'Pepatah' },
  { text: 'Bukan kecerdasan saja yang membawa sukses, tetapi juga hasrat untuk sukses dan komitmen untuk bekerja keras.',author: 'Harun Yahya' },
];
let quoteIdx = 0;

function showQuote() {
  const q = QUOTES[quoteIdx];
  document.getElementById('quoteText').textContent   = `"${q.text}"`;
  document.getElementById('quoteAuthor').textContent = `— ${q.author}`;
  quoteIdx = (quoteIdx + 1) % QUOTES.length;
}
function startQuoteRotation() {
  showQuote();
  setInterval(showQuote, 30000);
}

/* =====================================================
   STUDY TIPS
   ===================================================== */
const TIPS = [
  { title: 'POMODORO',         desc: '25 min focus, 5 min break. Repeat 4 times, then take a longer break.' },
  { title: 'ACTIVE RECALL',    desc: 'Test yourself instead of rereading. Write everything you remember without looking.' },
  { title: 'SPACED REPETITION',desc: 'Review material at increasing intervals — 1, 3, 7, 14 days — to cement memory.' },
  { title: 'FEYNMAN TECHNIQUE',desc: 'Explain the concept simply as if teaching a child. Gaps in explanation reveal weaknesses.' },
  { title: 'DEEP WORK',        desc: 'Block 2–4 hours of distraction-free work on your hardest task every single day.' },
  { title: 'CORNELL NOTES',    desc: 'Divide pages into cue, notes, and summary sections for structured review-ready notes.' },
  { title: 'SLEEP FIRST',      desc: 'Memory consolidation happens during sleep. Aim for 7–9 hours for peak performance.' },
  { title: 'EXERCISE',         desc: 'Even 20 min of walking boosts BDNF, improving memory and learning capacity by ~20%.' },
];

/* =====================================================
   DASHBOARD
   ===================================================== */
function renderDashboard() {
  renderTips();
  calcStats();
  renderTodayClasses();
  updateModeUI();
}

function renderTips() {
  document.getElementById('tipsContainer').innerHTML =
    TIPS.map(t => `
      <div class="tip-card">
        <div class="tip-title">${t.title}</div>
        <div class="tip-desc">${t.desc}</div>
      </div>`).join('');
}

function calcStats() {
  let totalSKS = 0, totalMinWeek = 0;
  const dayCount = {};
  APP.schedules.forEach(s => {
    totalSKS += parseInt(s.sks) || 0;
    const [sh, sm] = s.start.split(':').map(Number);
    const [eh, em] = s.end.split(':').map(Number);
    const dur = (eh * 60 + em) - (sh * 60 + sm);
    totalMinWeek += dur;
    dayCount[s.day] = (dayCount[s.day] || 0) + dur;
  });
  const activeDays = Object.keys(dayCount).length || 1;
  document.getElementById('statSKS').textContent        = totalSKS;
  document.getElementById('statHoursWeek').textContent  = (totalMinWeek / 60).toFixed(1);
  document.getElementById('statHoursDay').textContent   = (totalMinWeek / 60 / activeDays).toFixed(1);
}

function renderTodayClasses() {
  const today       = new Date().getDay();
  const todayScheds = APP.schedules
    .filter(s => s.day === today)
    .sort((a, b) => a.start.localeCompare(b.start));
  const el = document.getElementById('todayClassList');

  if (!todayScheds.length) {
    el.innerHTML = '<div class="no-class">No classes today 🎉</div>';
    return;
  }
  el.innerHTML = todayScheds.map(s => `
    <div class="today-class-item" style="border-left-color:${s.color};box-shadow:inset 0 0 8px ${s.color}20">
      <div class="class-dot" style="background:${s.color}"></div>
      <div class="class-time">${s.start} – ${s.end}</div>
      <div class="class-name">${s.name}</div>
      <div class="class-room">🏫 ${s.room}</div>
    </div>`).join('');
}

function setMode(m) {
  APP.mode = m;
  saveApp();
  updateModeUI();
}
function updateModeUI() {
  document.getElementById('modeWeekday').classList.toggle('active', APP.mode === 'weekday');
  document.getElementById('modeWeekend').classList.toggle('active', APP.mode === 'weekend');
  document.getElementById('modeDesc').textContent = APP.mode === 'weekday'
    ? 'Full academic mode: lectures, labs, and study groups.'
    : 'Rest & review mode: light study, hobbies, and recovery.';
}

/* =====================================================
   SIDEBAR & NAVIGATION
   ===================================================== */
function toggleSidebar() {
  const sb   = document.getElementById('sidebar');
  const ov   = document.getElementById('overlay');
  const hb   = document.getElementById('hamburgerBtn');
  const open = sb.classList.contains('open');
  sb.classList.toggle('open', !open);
  ov.classList.toggle('show', !open);
  hb.classList.toggle('open', !open);
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('hamburgerBtn').classList.remove('open');
}

let currentPage = 'dashboard';
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageId = 'page' + name.charAt(0).toUpperCase() + name.slice(1);
  const pageEl = document.getElementById(pageId);
  if (pageEl) pageEl.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active',
      n.getAttribute('onclick') && n.getAttribute('onclick').includes(`'${name}'`));
  });

  currentPage = name;
  closeSidebar();

  // Lazy renders
  if (name === 'weekly')          renderWeeklyView();
  if (name === 'metrics')         renderMetrics();
  if (name === 'focus')           updateFocusStats();
  if (name === 'personalization') loadProfileFields();
}

/* =====================================================
   SCHEDULE PAGE
   ===================================================== */
let selectedDay = new Date().getDay();

function renderDaySelector() {
  const now  = new Date();
  const dNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const el   = document.getElementById('daySelector');
  el.innerHTML = dNames.map((d, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() + ((i - now.getDay() + 7) % 7));
    return `
      <div class="day-btn ${i === selectedDay ? 'active' : ''}" onclick="selectDay(${i})">
        <span class="day-btn-name">${d}</span>
        <span class="day-btn-date">${date.getDate()}</span>
      </div>`;
  }).join('');
}

function selectDay(d) {
  selectedDay = d;
  renderDaySelector();
  loadScheduleList();
}

function toggleForm() {
  document.getElementById('addClassForm').classList.toggle('open');
}

function saveClass() {
  const name = document.getElementById('fName').value.trim();
  if (!name) { showToast('⚠️', 'Error', 'Course name is required!'); return; }

  const sched = {
    id:       Date.now().toString(),
    name,
    lecturer: document.getElementById('fLecturer').value.trim(),
    day:      parseInt(document.getElementById('fDay').value),
    room:     document.getElementById('fRoom').value.trim(),
    start:    document.getElementById('fStart').value,
    end:      document.getElementById('fEnd').value,
    sks:      parseInt(document.getElementById('fSKS').value) || 2,
    color:    document.getElementById('fColor').value
  };

  APP.schedules.push(sched);
  saveApp();
  document.getElementById('addClassForm').classList.remove('open');
  resetClassForm();
  loadScheduleList();
  renderTodayClasses();
  calcStats();
  showToast('✅', 'Saved', 'Class added successfully!');
}

function resetClassForm() {
  ['fName', 'fLecturer', 'fRoom'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('fSKS').value   = 2;
  document.getElementById('fStart').value = '08:00';
  document.getElementById('fEnd').value   = '09:40';
  document.getElementById('fColor').value = '#0ea5e9';
}

function loadScheduleList() {
  const list      = document.getElementById('scheduleList');
  const dayScheds = APP.schedules
    .filter(s => s.day === selectedDay)
    .sort((a, b) => a.start.localeCompare(b.start));

  if (!dayScheds.length) {
    list.innerHTML = '<div class="no-class">📭 No classes scheduled for this day</div>';
    return;
  }
  list.innerHTML = dayScheds.map(s => {
    const hasNotes = !!APP.notes[s.id];
    return `
      <div class="schedule-item" style="border-left-color:${s.color};box-shadow:-4px 0 12px ${s.color}30">
        <div class="sched-time">${s.start}–${s.end}</div>
        <div class="sched-info">
          <div class="sched-name">
            ${s.name}
            ${hasNotes ? '<span class="sched-badge">📝 Notes</span>' : ''}
          </div>
          <div class="sched-meta">
            <span>👤 ${s.lecturer || '—'}</span>
            <span>🏫 ${s.room || '—'}</span>
            <span>📚 ${s.sks} SKS</span>
          </div>
        </div>
        <div class="sched-actions">
          <div class="icon-btn" onclick="openNotes('${s.id}','${escHtml(s.name)}')" title="Notes">📝</div>
          <div class="icon-btn" onclick="deleteClass('${s.id}')" title="Delete">🗑</div>
        </div>
      </div>`;
  }).join('');
}

function deleteClass(id) {
  APP.schedules = APP.schedules.filter(s => s.id !== id);
  saveApp();
  loadScheduleList();
  renderTodayClasses();
  calcStats();
  showToast('🗑', 'Deleted', 'Class removed.');
}

function escHtml(s) {
  return (s || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

/* =====================================================
   NOTES MODAL
   ===================================================== */
let currentNoteId = null;

function openNotes(id, name) {
  currentNoteId = id;
  document.getElementById('modalTitle').textContent = name;
  document.getElementById('notesArea').value        = APP.notes[id] || '';
  renderPhotoPreview(id);
  document.getElementById('modalOverlay').classList.add('show');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  currentNoteId = null;
}

function saveNotes() {
  if (!currentNoteId) return;
  APP.notes[currentNoteId] = document.getElementById('notesArea').value;
  saveApp();
  loadScheduleList();
  closeModal();
  showToast('✅', 'Notes Saved', 'Your notes have been saved.');
}

function handlePhotos(e) {
  const files = Array.from(e.target.files);
  const id    = currentNoteId;
  if (!APP.photos[id]) APP.photos[id] = [];
  let loaded = 0;
  files.forEach(f => {
    const r = new FileReader();
    r.onload = ev => {
      APP.photos[id].push(ev.target.result);
      loaded++;
      if (loaded === files.length) {
        saveApp();
        renderPhotoPreview(id);
      }
    };
    r.readAsDataURL(f);
  });
}

function renderPhotoPreview(id) {
  const wrap   = document.getElementById('photoPreview');
  const photos = APP.photos[id] || [];
  wrap.innerHTML = photos
    .map(p => `<img class="photo-thumb" src="${p}" alt="note photo">`)
    .join('');
}

/* =====================================================
   WEEKLY VIEW
   ===================================================== */
function renderWeeklyView() {
  const grid      = document.getElementById('weeklyGrid');
  const today     = new Date().getDay();
  const dNames    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const orderedD  = [1, 2, 3, 4, 5, 6, 0];   // Mon–Sun
  const hours     = [];
  for (let h = 7; h <= 20; h++) hours.push(h);

  // Precompute events by (day, startHour)
  const evMap = {};
  APP.schedules.forEach(s => {
    const [sh] = s.start.split(':').map(Number);
    const key  = `${s.day}_${sh}`;
    if (!evMap[key]) evMap[key] = [];
    evMap[key].push(s);
  });

  // Header row
  let html = '<div class="weekly-time-cell"></div>';
  orderedD.forEach(d => {
    const isToday = d === today;
    html += `<div class="weekly-header-cell ${isToday ? 'today-col' : ''}">
      ${dNames[d]}${isToday ? ' ✦' : ''}
    </div>`;
  });

  // Data rows
  hours.forEach(h => {
    html += `<div class="weekly-time-cell">${String(h).padStart(2,'0')}:00</div>`;
    orderedD.forEach(d => {
      const isToday = d === today;
      const events  = evMap[`${d}_${h}`] || [];
      let evHtml    = '';
      events.forEach(ev => {
        const [sh, sm] = ev.start.split(':').map(Number);
        const [eh, em] = ev.end.split(':').map(Number);
        const span     = Math.max(1, Math.ceil(((eh * 60 + em) - (sh * 60 + sm)) / 60));
        evHtml += `
          <div class="weekly-event"
               style="background:${ev.color}18;border-left-color:${ev.color};
                      top:2px;height:${span * 48 - 8}px;color:${ev.color};
                      filter:drop-shadow(0 0 4px ${ev.color}80)">
            <div style="font-weight:600;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">
              ${ev.name}
            </div>
            <div style="opacity:0.7">${ev.start}–${ev.end}</div>
          </div>`;
      });
      html += `<div class="weekly-data-cell ${isToday ? 'today-col' : ''}">${evHtml}</div>`;
    });
  });

  grid.innerHTML = html;
}

/* =====================================================
   FOCUS MODE
   ===================================================== */
let focusDuration  = 30 * 60;
let focusRemaining = 30 * 60;
let focusRunning   = false;
let focusInterval  = null;
const CIRCUMFERENCE = 2 * Math.PI * 120;

// Init SVG dasharray
document.getElementById('focusProgress').style.strokeDasharray  = CIRCUMFERENCE;
document.getElementById('focusProgress').style.strokeDashoffset = 0;

function setPreset(min, btn) {
  if (focusRunning) return;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  focusDuration  = min * 60;
  focusRemaining = focusDuration;
  updateFocusDisplay();
}

function updateFocusDisplay() {
  const m = Math.floor(focusRemaining / 60);
  const s = focusRemaining % 60;
  document.getElementById('focusTimeDisplay').textContent =
    `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

  const progress = 1 - focusRemaining / focusDuration;
  document.getElementById('focusProgress').style.strokeDashoffset =
    CIRCUMFERENCE * (1 - progress);

  document.getElementById('focusStatus').textContent =
    focusRunning ? 'FOCUSING' : (focusRemaining === focusDuration ? 'READY' : 'PAUSED');
}

function toggleFocus() {
  if (focusRunning) {
    clearInterval(focusInterval);
    focusRunning = false;
    document.getElementById('playPauseBtn').textContent  = '▶';
    document.getElementById('focusStatus').textContent   = 'PAUSED';
  } else {
    focusRunning = true;
    document.getElementById('playPauseBtn').textContent  = '⏸';
    focusInterval = setInterval(() => {
      focusRemaining--;
      updateFocusDisplay();
      if (focusRemaining <= 0) {
        clearInterval(focusInterval);
        focusRunning = false;
        document.getElementById('playPauseBtn').textContent = '▶';
        completeFocus();
      }
    }, 1000);
  }
}

function resetFocus() {
  clearInterval(focusInterval);
  focusRunning   = false;
  focusRemaining = focusDuration;
  document.getElementById('playPauseBtn').textContent = '▶';
  updateFocusDisplay();
}

function skipFocus() {
  clearInterval(focusInterval);
  focusRunning   = false;
  focusRemaining = 0;
  document.getElementById('playPauseBtn').textContent = '▶';
  completeFocus();
}

function completeFocus() {
  const mins = Math.round(focusDuration / 60);
  APP.metrics.focusSessions++;
  APP.metrics.totalFocusMin += mins;
  APP.metrics.sessionHistory.unshift({ date: new Date().toLocaleDateString(), duration: mins });
  if (APP.metrics.sessionHistory.length > 20) {
    APP.metrics.sessionHistory = APP.metrics.sessionHistory.slice(0, 20);
  }

  // Streak logic
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (APP.metrics.lastSession === yesterday) {
    APP.metrics.streak++;
  } else if (APP.metrics.lastSession !== today) {
    APP.metrics.streak = 1;
  }
  APP.metrics.lastSession = today;

  saveApp();
  showToast('🎯', 'Focus Complete!', `Great work! ${mins} minutes focused.`);
  updateFocusStats();
  resetFocus();
}

function updateFocusStats() {
  const total = APP.metrics.totalFocusMin;
  document.getElementById('sessCount').textContent  = APP.metrics.focusSessions;
  document.getElementById('sessTotalH').textContent = `${Math.floor(total / 60)}h ${total % 60}m`;
  document.getElementById('sessStreak').textContent = APP.metrics.streak;
}

/* =====================================================
   METRICS PAGE
   ===================================================== */
function renderMetrics() {
  // Overview cards
  const totalSKS = APP.schedules.reduce((a, s) => a + (parseInt(s.sks) || 0), 0);
  let totalMin   = 0;
  APP.schedules.forEach(s => {
    const [sh, sm] = s.start.split(':').map(Number);
    const [eh, em] = s.end.split(':').map(Number);
    totalMin += (eh * 60 + em) - (sh * 60 + sm);
  });

  const overviewData = [
    { icon:'📚', num: totalSKS,                                    label: 'Total SKS'      },
    { icon:'⏱', num: (totalMin / 60).toFixed(1),                  label: 'Weekly Hours'   },
    { icon:'🎯', num: APP.metrics.focusSessions,                   label: 'Focus Sessions' },
    { icon:'🕒', num: Math.floor(APP.metrics.totalFocusMin / 60),  label: 'Focus Hours'    },
    { icon:'📅', num: APP.schedules.length,                        label: 'Total Classes'  },
    { icon:'🔥', num: APP.metrics.streak,                          label: 'Day Streak'     },
  ];

  document.getElementById('metricsOverview').innerHTML =
    overviewData.map(m => `
      <div class="glass-card metric-card">
        <div class="metric-icon">${m.icon}</div>
        <div class="metric-num">${m.num}</div>
        <div class="metric-label">${m.label}</div>
      </div>`).join('');

  // Weekly hours bars (Mon–Sun)
  const orderedD = [1, 2, 3, 4, 5, 6, 0];
  const dNames   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dayMins  = orderedD.map(d =>
    APP.schedules
      .filter(s => s.day === d)
      .reduce((a, s) => {
        const [sh,sm] = s.start.split(':').map(Number);
        const [eh,em] = s.end.split(':').map(Number);
        return a + (eh*60+em) - (sh*60+sm);
      }, 0)
  );
  const maxMin = Math.max(...dayMins, 1);
  document.getElementById('weeklyBars').innerHTML =
    dNames.map((d, i) => `
      <div class="progress-bar-wrap">
        <div class="progress-label"><span>${d}</span><span>${(dayMins[i]/60).toFixed(1)}h</span></div>
        <div class="progress-track">
          <div class="progress-fill"
               style="width:${dayMins[i]/maxMin*100}%;background:linear-gradient(90deg,#0ea5e9,#00f5ff)">
          </div>
        </div>
      </div>`).join('');

  // Subject breakdown
  const maxSKS = Math.max(...APP.schedules.map(s => parseInt(s.sks) || 0), 1);
  document.getElementById('subjectBreakdown').innerHTML =
    APP.schedules.length
      ? APP.schedules.map(s => `
          <div class="progress-bar-wrap">
            <div class="progress-label">
              <span style="color:${s.color}">${s.name}</span>
              <span>${s.sks} SKS</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:${(s.sks/maxSKS)*100}%;background:${s.color}"></div>
            </div>
          </div>`).join('')
      : '<div class="no-class">No classes yet</div>';

  // Session history
  document.getElementById('sessionHistory').innerHTML =
    APP.metrics.sessionHistory.length
      ? APP.metrics.sessionHistory.map(s => `
          <div class="session-hist-item">
            <span>🎯 Focus Session</span>
            <span style="color:var(--text-dim)">${s.date}</span>
            <span style="color:var(--accent-cyan)">${s.duration} min</span>
          </div>`).join('')
      : '<div class="no-class">No sessions yet. Start focusing! 🎯</div>';
}

/* =====================================================
   EXPORT / IMPORT / RESET
   ===================================================== */
function exportData() {
  const blob = new Blob([JSON.stringify(APP, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `aae_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📤', 'Exported', 'Data exported successfully!');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = ev => {
    try {
      const parsed = JSON.parse(ev.target.result);
      APP = { ...APP, ...parsed };
      saveApp();
      showToast('📥', 'Imported', 'Data restored! Reloading...');
      setTimeout(() => location.reload(), 1000);
    } catch (err) {
      showToast('⚠️', 'Error', 'Invalid backup file. Please try again.');
    }
  };
  r.readAsText(file);
}

function resetData() {
  if (!confirm('Are you sure? This will permanently delete ALL your AAE data!')) return;
  if (!confirm('Final confirmation — this action CANNOT be undone. Continue?')) return;
  localStorage.removeItem('aae_data');
  location.reload();
}

/* =====================================================
   PERSONALIZATION
   ===================================================== */
const AVATARS = ['🎓','🚀','⭐','🧠','💡','🦁','🐉','🌟','🔮','🎯','🌈','🦊','🐺','🦋','🌙'];
let avatarIdx = 0;

function cycleAvatar() {
  avatarIdx = (avatarIdx + 1) % AVATARS.length;
  const av = AVATARS[avatarIdx];
  document.getElementById('profileAvatar').textContent = av;
  APP.avatar = av;
}

function loadProfileFields() {
  const p = APP.profile;
  document.getElementById('pName').value     = p.name     || APP.user || '';
  document.getElementById('pUni').value      = p.uni      || '';
  document.getElementById('pMajor').value    = p.major    || '';
  document.getElementById('pSemester').value = p.semester || '1';
  document.getElementById('pNIM').value      = p.nim      || '';
  document.getElementById('pMotto').value    = p.motto    || '';
  document.getElementById('profileAvatar').textContent = APP.avatar || '🎓';
  avatarIdx = AVATARS.indexOf(APP.avatar);
  if (avatarIdx === -1) avatarIdx = 0;
}

function saveProfile() {
  APP.profile = {
    name:     document.getElementById('pName').value.trim()     || APP.user,
    uni:      document.getElementById('pUni').value.trim(),
    major:    document.getElementById('pMajor').value.trim(),
    semester: document.getElementById('pSemester').value,
    nim:      document.getElementById('pNIM').value.trim(),
    motto:    document.getElementById('pMotto').value.trim(),
  };
  if (APP.profile.name) {
    APP.user = APP.profile.name;
    document.getElementById('welcomeName').textContent = APP.user;
    document.getElementById('sidebarName').textContent  = APP.user;
  }
  APP.avatar = document.getElementById('profileAvatar').textContent;
  document.getElementById('sidebarAvatar').textContent = APP.avatar;
  saveApp();
  showToast('✅', 'Profile Saved', 'Your profile has been updated!');
}

/* =====================================================
   SETTINGS
   ===================================================== */
function loadSettingsUI() {
  const s = APP.settings;
  document.getElementById('starIntensity').value    = s.star_intensity ?? 2;
  document.getElementById('morningTimeInput').value = s.morning_time   || '07:00';
  document.getElementById('nightTimeInput').value   = s.night_time     || '22:00';
  document.getElementById('firstDaySelect').value   = s.first_day      ?? 1;
}

function loadSettingsState() {
  const s = APP.settings;
  const MAP = {
    notif_class:   'tNotifClass',
    notif_morning: 'tNotifMorning',
    notif_night:   'tNotifNight',
    notif_study:   'tNotifStudy',
    auto_theme:    'tAutoTheme'
  };
  Object.entries(MAP).forEach(([key, id]) => {
    if (s[key]) document.getElementById(id).classList.add('on');
  });
  starIntensityVal = parseInt(s.star_intensity) || 2;
}

function toggleSetting(key, elemId) {
  APP.settings[key] = !APP.settings[key];
  document.getElementById(elemId).classList.toggle('on', APP.settings[key]);
  saveApp();
}

function saveSetting(key, value) {
  APP.settings[key] = value;
  if (key === 'star_intensity') {
    starIntensityVal = parseInt(value);
    initStars();
  }
  saveApp();
}

function setAccent(c1, c2, dot) {
  document.querySelectorAll('.accent-dot').forEach(d => d.classList.remove('active'));
  dot.classList.add('active');
  document.documentElement.style.setProperty('--accent-blue', c1);
  document.documentElement.style.setProperty('--accent-cyan', c2);
  APP.settings.accent  = c1;
  APP.settings.accent2 = c2;
  saveApp();
}

function applyAccentFromSettings() {
  if (APP.settings.accent)  document.documentElement.style.setProperty('--accent-blue', APP.settings.accent);
  if (APP.settings.accent2) document.documentElement.style.setProperty('--accent-cyan', APP.settings.accent2);
}

/* =====================================================
   THEME (Dark / Light)
   ===================================================== */
let isDark = true;

function toggleTheme() {
  isDark = !isDark;
  applyTheme(!isDark);
}
function applyTheme(light) {
  document.body.classList.toggle('light-mode', light);
  document.getElementById('themeBtn').textContent = light ? '☀️' : '🌙';
  isDark = !light;
}

/* =====================================================
   TOAST NOTIFICATIONS
   ===================================================== */
function showToast(icon, title, msg) {
  const container = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className   = 'toast';
  t.innerHTML   = `
    <div class="toast-icon">${icon}</div>
    <div>
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity 0.3s';
    t.style.opacity    = '0';
    setTimeout(() => t.remove(), 300);
  }, 4000);
}

/* =====================================================
   EASTER EGG — FOCUS FIGHTER (triggered by 5× name click)
   ===================================================== */
let eggClicks = [], eggTimeout;

function eggClick() {
  const now = Date.now();
  eggClicks.push(now);
  eggClicks = eggClicks.filter(t => now - t < 1500);
  clearTimeout(eggTimeout);
  if (eggClicks.length >= 5) {
    eggClicks = [];
    openGame();
  }
  eggTimeout = setTimeout(() => { eggClicks = []; }, 1500);
}

/* =====================================================
   FOCUS FIGHTER — Space Shooter Mini-Game
   ===================================================== */
let gameRunning = false, gameAF;
let ship, bullets, enemies, particles, score, lives, wave, waveTimer;

function openGame() {
  document.getElementById('gameOverlay').classList.add('show');
  startGame();
}
function closeGame() {
  document.getElementById('gameOverlay').classList.remove('show');
  gameRunning = false;
  cancelAnimationFrame(gameAF);
  // Clean up listeners
  document.onkeydown = null;
  document.onkeyup   = null;
}

function startGame() {
  document.getElementById('gameOver').classList.remove('show');
  const canvas = document.getElementById('gameCanvas');
  const ctx    = canvas.getContext('2d');

  ship     = { x: 200, y: 440, r: 14 };
  bullets  = [];
  enemies  = [];
  particles = [];
  score    = 0;
  lives    = 3;
  wave     = 1;
  waveTimer = 0;

  let mouseX = 200, mouseY = 440;
  let keys = {};

  document.getElementById('gScore').textContent = '0';
  document.getElementById('gWave').textContent  = '1';
  document.getElementById('gLives').textContent = '❤❤❤';

  canvas.onmousemove = e => {
    const r = canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  };
  canvas.onclick = () => {
    bullets.push({ x: ship.x, y: ship.y - 14, r: 5, vy: -8 });
  };
  document.onkeydown = e => {
    keys[e.code] = true;
    if (e.code === 'Space') {
      e.preventDefault();
      bullets.push({ x: ship.x, y: ship.y - 14, r: 5, vy: -8 });
    }
  };
  document.onkeyup = e => { keys[e.code] = false; };

  function spawnWave() {
    const count = 3 + wave;
    for (let i = 0; i < count; i++) {
      enemies.push({
        x:     30 + Math.random() * 340,
        y:     -20 - Math.random() * 100,
        r:     14 + Math.random() * 10,
        hp:    wave, maxhp: wave,
        speed: 1 + wave * 0.3,
        color: `hsl(${Math.random() * 360},80%,60%)`
      });
    }
  }

  function spawnParticles(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 4;
      particles.push({ x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, life: 1, color });
    }
  }

  gameRunning = true;

  function loop() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, 400, 500);
    ctx.fillStyle = '#020817';
    ctx.fillRect(0, 0, 400, 500);

    // Ship movement via keyboard
    if (keys['ArrowLeft'])  mouseX = Math.max(14,  mouseX - 5);
    if (keys['ArrowRight']) mouseX = Math.min(386,  mouseX + 5);
    if (keys['ArrowUp'])    mouseY = Math.max(14,  mouseY - 5);
    if (keys['ArrowDown'])  mouseY = Math.min(486,  mouseY + 5);

    // Lerp ship toward mouse
    ship.x += (mouseX - ship.x) * 0.08;
    ship.y += (mouseY - ship.y) * 0.08;

    // Draw ship
    ctx.save();
    ctx.shadowColor = '#00f5ff'; ctx.shadowBlur = 16;
    ctx.fillStyle   = '#00f5ff';
    ctx.beginPath();
    ctx.moveTo(ship.x,      ship.y - 14);
    ctx.lineTo(ship.x - 10, ship.y + 12);
    ctx.lineTo(ship.x + 10, ship.y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Bullets
    bullets = bullets.filter(b => b.y > 0);
    bullets.forEach(b => {
      b.y += b.vy;
      ctx.save(); ctx.shadowColor = '#00f5ff'; ctx.shadowBlur = 10;
      ctx.fillStyle = '#00f5ff';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    // Wave spawn
    waveTimer++;
    if (waveTimer > 150 && enemies.length < 3) {
      spawnWave();
      wave++;
      waveTimer = 0;
      document.getElementById('gWave').textContent = wave;
    }
    if (enemies.length === 0) { spawnWave(); waveTimer = 0; }

    // Enemies
    enemies = enemies.filter(e => e.y < 520);
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const e = enemies[ei];
      e.y += e.speed;

      ctx.save();
      ctx.shadowColor = e.color; ctx.shadowBlur = 12;
      ctx.fillStyle   = e.color + '44';
      ctx.strokeStyle = e.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.restore();

      // HP bar
      const bw = e.r * 2;
      ctx.fillStyle = '#333';
      ctx.fillRect(e.x - e.r, e.y - e.r - 8, bw, 4);
      ctx.fillStyle = e.color;
      ctx.fillRect(e.x - e.r, e.y - e.r - 8, bw * (e.hp / e.maxhp), 4);

      // Bullet collision
      for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const b  = bullets[bi];
        const dx = b.x - e.x, dy = b.y - e.y;
        if (Math.sqrt(dx * dx + dy * dy) < b.r + e.r) {
          bullets.splice(bi, 1);
          e.hp--;
          if (e.hp <= 0) {
            spawnParticles(e.x, e.y, e.color);
            score += 10 * wave;
            document.getElementById('gScore').textContent = score;
            enemies.splice(ei, 1);
          }
          break;
        }
      }

      // Ship collision
      if (ei < enemies.length) {
        const dx = ship.x - e.x, dy = ship.y - e.y;
        if (Math.sqrt(dx * dx + dy * dy) < ship.r + e.r - 4) {
          enemies.splice(ei, 1);
          lives--;
          document.getElementById('gLives').textContent = '❤'.repeat(Math.max(0, lives));
          if (lives <= 0) {
            document.getElementById('goScore').textContent = score;
            document.getElementById('gameOver').classList.add('show');
            gameRunning = false;
            return;
          }
        }
      }
    }

    // Particles
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life -= 0.04;
      ctx.globalAlpha = p.life;
      ctx.fillStyle   = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    gameAF = requestAnimationFrame(loop);
  }

  spawnWave();
  loop();
}

/* =====================================================
   INIT — Bootstrap everything on DOMContentLoaded
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadApp();
  initStars();
  requestAnimationFrame(drawStars);
  applyAccentFromSettings();
  runLoadingScreen();
});
