# 📰 News UX Lab

A live classroom activity for a UX research lecture on **ease of use**. About 30 students browse **three simulated news sites** on their phones (Egyptian Arabic or English) and complete tasks on each. Every interaction is recorded, and the projector shows an **animated live usability analysis with students' names**: task success, time, taps, errors, time lost to pop-ups and ease ratings. At the end, each phone shows a personal **"News Wrapped"** story.

> All sites, brands, ads and news stories are fictional (classroom simulation).

---

## 1a · Permanent public link: Render (recommended)

1. Sign in at https://render.com with GitHub (free, no card).
2. **New + → Blueprint** → pick this repo → **Apply**. Render reads `render.yaml`.
3. After ~2 minutes you get a permanent link like `https://mass-com-ux-lab.onrender.com`.
   - Instructor panel: `…/admin?key=ux2026` · Projector: `…/live?key=ux2026`
4. The free plan sleeps after 15 minutes with no visitors. Open the link 2 minutes before class to wake it.
   Data is kept in memory/disk only while it runs: export it before class ends.

## 1b · Start it in GitHub Codespaces (≈2 min)

1. Push this folder to a GitHub repo, then **Code → Codespaces → Create codespace**.
   The dev container installs everything automatically.
2. In the Codespace terminal run:
   ```bash
   npm start
   ```
3. Make the port **public** so phones can reach it. Either:
   - **Ports** tab → right-click port **3000** → *Port visibility* → **Public**, or
   - run `npm run public`
4. The terminal prints three links:
   | Who | URL |
   |---|---|
   | Students (QR code shown on the projector) | `https://<codespace>-3000.app.github.dev` |
   | **Instructor panel** (use on your phone or laptop) | `…/admin?key=ux2026` |
   | **Projector dashboard** | `…/live?key=ux2026` |

Change the key with `ADMIN_KEY=yourkey npm start`.

⚠️ **Before the lecture:** Codespaces stop after ~30 min idle by default. Open the Codespace 5–10 min before class and test with 2–3 phones. You can raise the idle timeout in GitHub → Settings → Codespaces.

---

## 2 · Run of show (≈15–18 min)

| Step | Instructor panel button | What students see |
|---|---|---|
| 1 | **Lobby** | Scan QR → choose language → name → consent |
| 2 | **Al-Khabar Now** (3 min) | Busy local portal: full-screen ad, cookie bar, sticky ad, split articles, fake iPhone prize |
| 3 | 🎯 **Push mission** | "Find the final score of Nile Stars vs Delta FC" (hidden on page 3) |
| 4 | ⚡ **Push quick check** | Ease rating 1–7 (Single Ease Question) + "what slowed you down the most?" |
| 5 | **The Global Ledger** (3 min) | Serious broadsheet: cookie wall (847 partners), metered paywall, confirmshaming newsletter |
| 6 | 🎯 **Push mission** | "Turn off breaking-news alerts" (menu → account → preferences → guilt-trip → survey) |
| 7 | ⚡ **Push quick check** | Same as above |
| 8 | **ViralVault** (3 min) | Clickbait site: notification prompt, app banner, infinite feed, pre-roll video ad, disguised sponsored posts |
| 9 | 🎯 **Push mission** | "What is food #7?" (one item per page + ads) |
| 10 | ⚡ **Push quick check** | Same as above |
| 11 | **Spot the ad** | Tap the posts you think are ads (2 are disguised) |
| 12 | **Reveal ✨** | Phones: personal Wrapped story. Projector: walk through the scenes |

The phones move automatically when you change the stage.

---

## 3 · Projector dashboard (`/live`)

Keyboard (a presentation clicker works too):

| Key | Action |
|---|---|
| → / Space / PageDown | next scene |
| ← / PageUp | previous scene |
| `1`–`9`, `0` | jump to a scene |
| `L` | switch Arabic ↔ English |
| `C` | show stage/mission controls on the projector |
| `F` | flip all persona cards (on the Personas scene) |
| ↓ / ↑ | next / previous student (on the Spotlight scene) |

**Scenes:** Join (QR + names) · Live feed · Task success (effectiveness) · Effort: time & taps (efficiency) · Time lost to pop-ups · Errors & rage taps · Reading · Say vs Do (ease rating vs behaviour) · What slowed you down · Site usability scores · Tap heatmaps · Persona wall · Student spotlight · Hall of fame.

Tip: keep the dashboard on the **Live** scene while students browse; their names and actions stream in.

---

## 4 · What is recorded

| Area | Data |
|---|---|
| Session | name, language, time on each site (visible time only) |
| Reading | articles opened, scroll depth, time vs word count → *read* or *skimmed*, bounces, infinite-feed items |
| Headlines | which headline was tapped and its type (clickbait / serious / sponsored) and topic |
| Privacy | cookie choice + seconds to decide + opened settings, notification allow/block, newsletter subscribe/close/decline |
| Ads & pop-ups | ads that appeared on screen, ad taps, time to close full-screen ad, accidental taps, video skip second, fake prize claim, paywall choice, app banner |
| Frustration | rage taps (3+ fast taps in the same spot), dead taps (tapping non-clickable things) |
| Tasks | success/fail, time on task, taps, pages visited, dead taps, gave up (all three sites) |
| Quick checks | ease rating 1–7 (SEQ) and the main blocker |
| Interruptions | seconds lost to cookie banners, full-screen ad, newsletter, notification prompt, video ad |
| Spot the ad | hits, missed disguised ads, false alarms |
| Heatmaps | position of every tap on each homepage |

**Personas:** 📖 Deep Reader · 🏃 Skimmer · 🎣 Clickbait Catch · 🧐 Careful One · ⚡ Speedrunner · 🥷 Popup Ninja · 🫣 Mis-Tapper · 🚪 Bouncer · 🎯 Mission Hunter. Each student also gets a personal ease-of-use report card.

---

## 5 · Privacy & data

- Students give consent on the join screen (their name and results appear on the projector).
- No device identifiers, no real personal data. Payment and "prize" forms never collect anything.
- Data is saved to `data/session.json` (so a restart doesn't lose it).
- Instructor panel → **Export JSON** (for your slides) and **Delete all data & reset** after class.

---

## 6 · Customising

- All texts (articles, headlines, ads, mission questions) are in `public/js/content.js` (`ar` / `en`).
- Images are generated illustrations (no internet needed). Swap in your own if you like.
- Persona rules and scores: `lib/analysis.js`.
- Test locally: `npm install && npm start`, then open `http://localhost:3000` in a phone-sized browser window.
