# ⬡ Alex Academy Ecosystem (AAE)

> **A dark sci-fi futuristic academic dashboard** — built with pure HTML, CSS, and JavaScript. No frameworks, no build tools, no dependencies beyond Google Fonts. All data stored locally via `localStorage`.

---

## 📁 File Structure

```
aae/
├── index.html    ← Main HTML structure & page layouts
├── style.css     ← All styling, design system, animations
├── app.js        ← All application logic & interactivity
└── README.md     ← This file
```

> 💡 **All three files must be in the same folder.** Open `index.html` in any modern browser.

---

## 🚀 Quick Start

1. Download or clone all files into a folder
2. Open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari)
3. Watch the boot sequence, then enter your name
4. You're in! 🎓

No installation, no npm, no build step — just open and use.

---

## 🎨 Design System

### Fonts (Google Fonts CDN)
| Role | Font | Usage |
|------|------|-------|
| Headers, Timer, Logo | `Orbitron` | Futuristic geometric display |
| Body, Content, UI | `Exo 2` | Clean, readable, weights 100–600 |
| Labels, Monospace | `Share Tech Mono` | Technical, code-like text |

### Color Palette
```css
--bg-primary:   #020817   /* Deep space black-blue */
--bg-secondary: #0a1628   /* Card backgrounds */
--bg-glass:     rgba(10,25,60,0.6)  /* Glassmorphism */
--accent-blue:  #0ea5e9   /* Primary accent */
--accent-cyan:  #06b6d4   /* Secondary accent */
--accent-neon:  #00f5ff   /* Neon glow effects */
--accent-purple:#818cf8   /* Tertiary accent */
--text-primary: #e2e8f0
--text-secondary:#94a3b8
--text-dim:     #475569
```

---

## ✨ Features

### 🖥 Loading Screen
- Animated hexagon SVG logo with neon pulsing glow
- Boot sequence messages appear one-by-one with delays
- Gradient neon progress bar fills alongside text
- Smooth fade-out transition to login

### 🔐 Login
- Glassmorphism card with rotating conic gradient overlay
- Name saved to `localStorage` — skips login on return
- Input validation with red glow on empty submit
- Enter key support

### 🏠 Dashboard
| Card | Description |
|------|-------------|
| **Next Class Countdown** | Real-time `HH:MM:SS` with blinking colons |
| **Weather** | Simulated weather from preset array |
| **Daily Motivation** | 8 quotes rotating every 30 seconds |
| **Academic Stats** | SKS/week, weekly hours, daily hours (from schedule data) |
| **Today's Classes** | Live list of today's scheduled classes |
| **Study Mode** | Toggle between Weekday / Weekend mode |
| **Tips & Tricks** | Horizontal scrollable tip cards (Pomodoro, Feynman, etc.) |

### 📅 Schedule
- Add classes with: name, lecturer, day, room, time, SKS, custom color
- Day selector (Mon–Sun) showing actual dates
- Color-coded schedule items with neon glow borders
- Notes modal per class (textarea + multi-photo upload → base64)
- Delete classes with confirmation via toast

### 🗓 Weekly View
- Full time-grid layout (Mon–Sun × 07:00–20:00)
- Today's column highlighted with neon border
- Events rendered at correct position with color from schedule
- Horizontal scroll on mobile

### 🎯 Focus Mode
- 3 presets: 30 / 60 / 120 minutes
- SVG circular progress ring (animated `stroke-dashoffset`)
- Play / Pause / Reset / Skip controls
- Ambient sound selector (UI only — no audio files needed)
- Sessions auto-saved to metrics on completion
- Day streak tracking

### 📊 Metrics
- Overview: Total SKS, weekly hours, focus sessions, focus hours, class count, streak
- Weekly hours bar chart (per day)
- Subject breakdown progress bars (colored per class)
- Recent session history (last 20)

### 💾 Export & Import
- **Export:** Full `APP` object → `.json` download
- **Import:** Upload `.json` → restore & reload
- **Reset:** Double-confirm wipe of all `localStorage` data

### 👤 Personalization
- Avatar emoji cycle (15 emoji options)
- Display name, university, major, semester, student ID, motto
- Saves → updates sidebar & welcome banner in real-time

### ⚙️ Settings
| Section | Options |
|---------|---------|
| Notifications | Class reminder, morning greeting, night rest, study reminder |
| Appearance | Auto light/dark theme, starfield intensity (0–3), accent color picker |
| Schedule | First day of week, morning greeting time, night rest time |

### 🌗 Theme
- **Dark mode** (default): Deep space aesthetic
- **Light mode**: Clean soft blue tones
- **Auto-theme**: Switches at 06:00 (light) and 17:00 (dark) when enabled
- Toggle button in header (🌙 / ☀️)

### 🔔 Notifications
- Checked every second via clock tick
- Class reminder 60 min before start time
- Morning greeting at configured time
- Night rest reminder at configured time
- Toast-based UI notifications (browser `Notification.requestPermission()` also requested)

---

## 🎮 Easter Egg — Focus Fighter

**Trigger:** Click your name in the Welcome Banner **5 times within 1.5 seconds**

A mini space shooter game launches:

| Control | Action |
|---------|--------|
| Mouse Move | Aim ship |
| Click / Spacebar | Shoot |
| Arrow Keys | Manual movement |

- Ship uses lerp smoothing toward mouse position
- Enemies spawn in waves, gain HP each wave
- Colorful particle explosions on enemy destroy
- Score multiplied by current wave number
- 3 lives — game over screen with restart option

---

## 💾 Data Structure (`localStorage` key: `aae_data`)

```js
{
  user:     "Scholar Name",
  avatar:   "🎓",
  profile: {
    name, uni, major, semester, nim, motto
  },
  schedules: [{
    id, name, lecturer, day (0-6), start, end, room, sks, color
  }],
  notes:   { [scheduleId]: "note text" },
  photos:  { [scheduleId]: ["base64...", ...] },
  settings: {
    notif_class, notif_morning, notif_night, notif_study,
    auto_theme, morning_time, night_time,
    first_day, star_intensity,
    accent, accent2
  },
  metrics: {
    focusSessions, totalFocusMin, streak,
    lastSession, sessionHistory: [{ date, duration }]
  },
  mode: "weekday" | "weekend"
}
```

---

## 📱 Responsive Design

| Breakpoint | Adjustments |
|-----------|-------------|
| `> 768px` | Full multi-column grid, sidebar slide-in |
| `≤ 768px` | Single column dashboard, 4-col day selector, smaller focus timer |

---

## 🛠 Technical Notes

### No Frameworks
Pure vanilla JavaScript — no React, Vue, Angular, or jQuery.

### No Build Tools
No webpack, Vite, or npm required. Just three files.

### Performance
- Starfield uses `requestAnimationFrame` (not `setInterval`)
- Weekly grid and Metrics render only when those pages are visited (lazy rendering)
- Data saved on form submit, not on every keystroke
- CSS transitions preferred over JS animation

### Browser Support
| Browser | Status |
|---------|--------|
| Chrome 90+ | ✅ Full support |
| Edge 90+ | ✅ Full support |
| Firefox 88+ | ✅ Full support |
| Safari 14+ | ✅ Full support (some `backdrop-filter` may vary) |

> ⚠️ `backdrop-filter` (glassmorphism blur) may require hardware acceleration. Works best in Chromium-based browsers.

---

## 🗂 Page Reference

| Page ID | Nav Label | Description |
|---------|-----------|-------------|
| `pageDashboard` | Dashboard | Main overview & widgets |
| `pageSchedule` | Schedule | Add/view/manage classes by day |
| `pageWeekly` | Weekly View | Full-week time grid |
| `pageFocus` | Focus Mode | Countdown timer + sessions |
| `pageMetrics` | Metrics | Stats, charts, history |
| `pageExport` | Export & Import | Data backup & restore |
| `pagePersonalization` | Personalization | Profile & avatar |
| `pageSettings` | Settings | Toggles, theme, times |

---

## 🎨 Customization

### Change Accent Color
In **Settings → Appearance**, click any of the 5 color dots. The accent persists via `localStorage`.

Or manually in `style.css`:
```css
:root {
  --accent-blue: #0ea5e9;
  --accent-cyan: #06b6d4;
  --accent-neon: #00f5ff;
}
```

### Add More Quotes
In `app.js`, find the `QUOTES` array and add objects:
```js
{ text: "Your quote here.", author: "Author Name" }
```

### Add More Tips
In `app.js`, find the `TIPS` array:
```js
{ title: 'MY TECHNIQUE', desc: 'Description of the study tip.' }
```

### Change Boot Messages
In `app.js`, edit `BOOT_MESSAGES`:
```js
const BOOT_MESSAGES = [
  '▶ Your custom message...',
  // ...
];
```

---

## 📋 Checklist

- [x] Loading screen with boot sequence
- [x] Login saves name to localStorage
- [x] Skip login if name already stored
- [x] Animated gradient on user name
- [x] Starfield background (all pages)
- [x] Real-time clock
- [x] Next class countdown
- [x] Add/delete schedule entries
- [x] Notes + photo upload per class
- [x] Weekly time grid
- [x] Focus timer with SVG circle
- [x] Session history in metrics
- [x] Export → JSON download
- [x] Import → JSON restore
- [x] Reset with double confirm
- [x] All settings toggle & persist
- [x] Profile saves + updates UI
- [x] Easter egg game (5× click)
- [x] Toast for all key actions
- [x] Responsive (375px – 1440px)

---

## 📜 License

This project is open for personal and educational use.  
Built with ❤️ for the Alex Academy Ecosystem.

---

*Alex Academy Ecosystem — Fueling scholars, one session at a time.* ⬡
