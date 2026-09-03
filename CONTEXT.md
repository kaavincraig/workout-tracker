# Workout-Tracker — Project Context (for resuming in a new session)

## What this is
A personal gym workout tracker ("Sid's Workout Tracker") — a **client-only single-page app** served via GitHub Pages, with a **Google Apps Script** web app as its cloud backend. Two data files live in a Drive "Workout Tracker" folder:

- `workout_data.json` — session logs + static split for Day 1–4.
- `custom_workouts.json` — **custom workout routines** you build (new v1.3.0 feature).

## Repo layout
| File | Purpose |
|---|---|
| `index.html` | The whole app. HTML + CSS + JS in one file (single `<script>` block starting line ~1137 with `var standardWarmupList`). |
| `GoogleAppsScript.gs` | Apps Script web app: `doGet`/`doPost` honoring a `target` parameter (`workout` / `custom_workouts`) mapping to a Drive file. |
| `exercise_master_list.html` | Static read-only reference: vitals, nutrition, full exercise catalog. The catalog is transcribed into the app's `CATEGORIES` array. |
| `personal_vitals.json` | Profile: age 45, 66 kg → 70 kg target, vegetarian, inguinal hernia constraints. |
| `CONTEXT.md` | This file. |

## Key invariants (don't break these)
1. **One day active at a time.** `active_timer_<dayId>` in `localStorage`; while set, other day tabs are locked and `markEdited` blocks edits. `getActiveRunningDay()` walks the plan and matches `timer.date === today`.
2. **Day IDs are parsed with `resolveDayId(el.id)`** (index.html), **not** with the old `/^(day[0-9]+)/` regex. Custom workout IDs contain underscores (`customXXXX_1`); the old regex stopped at the first underscore and broke the active-gate. `resolveDayId` matches against the real `workout_split_plan` keys in descending length order.
3. **Custom plans are `custom: true`** in the plan object; they live in `workout_split_plan` but are excluded from the `workout` push payload and from "Delete this custom workout" for Day 1–4.
4. **Auto-save fires only when a workout is active.** `triggerAutoSave(dayId)` debounces 600 ms → `saveSession(...)`. `saveSession` merges warmups + edited sets into a single log keyed by `sessionId`, prepends/updates `workout_master_logs`.
5. **Local save (localStorage) and cloud save are independent.** If the cloud URL is not set or the Apps Script is broken, the app still works — just no Drive sync.
6. **Hydration rule:** when a day's log matches **today's date**, values render white (`user-edited`). When the match is for another day, values render gray via `setGrayValue(el, value)` (sets text + `data-val`, strips `user-edited`/`data-edited`, does not trigger the saved badge). This is why old logs from last week look gray after a reload.

## Data flow (current, v1.3.1)
### Local
- `workout_master_logs` (array) — session logs.
- `active_timer_<dayId>` — running workout timer.
- `gdrive_webhook_url` — the Apps Script `/exec` URL.
- `customworkout_<id>` — offline mirror of one custom plan.
- `customworkout_indices` — list of custom plan IDs.
- All under the origin (so GH Pages, `localhost:8765`, and `file://` are separate stores).

### Cloud
- **Push** is **automatic** on: end-of-workout (`saveSession`), delete log (`deleteSingleLog`), clear all (`clearWorkoutHistory`), save custom (`saveCustomWorkout`), delete custom (`deleteCustomWorkout`).
- **Pull** is manual: "Pull from Drive" (workout) and "Pull Custom".
- The client posts to the Apps Script with a hidden `<form>` including `contents` (JSON) + `target` (which file). It **does not send the Apps Script's `MY_SECRET_KEY`** because the deployment is published as "Anyone" — the key is only used to reject requests that don't know it, but for an "Anyone" URL the key check still enforces.

**IMPORTANT GOTCHA:** If you use `https://script.google.com/macros/s/.../exec?key=WRONG` in the URL, the `doGet`/`doPost` **rejects every request with `{status:"unauthorized"}`**. The site *loads fine* but no cloud sync happens. Verify the key in the URL matches `MY_SECRET_KEY` in `GoogleAppsScript.gs` (currently `MYJEY`).

## Custom workout feature — how it works
- **Builder view** (＋ button, first tab): a static catalog in a `CATEGORIES` array (transcribed from `exercise_master_list.html`), with `＋ Add` / `✓ Added` toggles, a search box, an ordered "your workout" list with `✕ Remove`, a name input prefilled `CustomWorkout_<date>`, and `Save Workout`.
- **Save** → creates a `custom<base36>_<n>` id, injects into `workout_split_plan`, caches to `localStorage`, auto-pushes to Drive's `custom_workouts.json`.
- **Custom tab** is rendered by the same `renderWorkoutForms()` loop; it gets a red `Delete this custom workout` button in its header because `day.custom === true` (the Day 1–4 plans never set this).
- **Hydrate**: `hydrateDayForm(dayId)` works on any day id (day or custom) because `resolveDayId` handles both.
- **Pull Custom** merges the array from `custom_workouts.json` into `workout_split_plan` + localStorage cache, re-renders, then `switchTab(prevActiveTab)` so the user stays on Cloud Sync.
- **Session logs** for a custom workout are stored in the same `workout_master_logs` array (so they appear in History and can be pulled/pushed like Day 1–4 logs).

## Security / PIN gates
- **Per-log delete** (`🗑️ Delete`): requires PIN **1981**.
- **Clear all** (`Clear All` in History): requires PIN **1986**.
- Both use `verifyDeletePin(expectedPin)`. PINs are in the client (visible in source) — a deterrent, not a real boundary.

## Bug history (most recent first)
1. **v1.3.1 — Pull/Pull Custom visually yanked the user to Day 1.**
   `renderWorkoutForms()` re-renders and marks the first day tab active; a pull re-rendered forms. Fix: capture the currently-active non-day tab before the re-render and `switchTab()` back to it in `handleDriveDataResponse` and `handleCustomWorkoutsResponse`. `deleteCustomWorkout` only jumps to Day 1 if the deleted tab is the one in view.
2. **v1.3.0 — Custom day steppers stayed gray and disabled.**
   The day-id regex `/^([a-zA-Z][a-zA-Z0-9]*)/` stopped at the first underscore, so custom IDs (`customXXXX_1`) failed the `isWorkoutActive(dayId)` gate → `modifyVal`/`tapDefaultVal`/`markEdited` bailed. Fix: `resolveDayId()` matches against actual plan keys.
3. **Earlier — old (non-today) log values rendered white.**
   The `forceLatest` branch of `hydrateDayForm` picked *any* log for the day. Fix: prefer a log for **today's date**; otherwise apply `setGrayValue` (gray + no `user-edited` class) so past values appear as reference, not "edited today".
4. **Day 2 content** — "Lightweight Barbell Squat" → "Barbell Squat" (score 9.5, 3–4 × 6–8 RPE 7–8, default 105×7); the Goblet Squat's alt on the same day was updated too.
5. **Kettlebell Swing (Light)** added to the warmup list (id `w_kb_swing`, after `w_ankle_rot`) and to the master list (Hip Hinge section).

## Version history
- **1.4.0** — "Export custom_workouts.json" button in Manual Backup & Restore (`downloadCustomWorkoutsJSON()`); "✨ Auto-Save Ready" badge moved from header to footer (above version number).
- **1.3.1** — Fix: pull from Drive no longer jumps to Day 1.
- **1.3.0** — Custom workout builder + custom_workouts.json + removed manual push buttons (push is automatic) + `resolveDayId` fix.
- **1.2.0** — App version string in footer + `window.APP_VERSION`.
- **1.1.x** — PIN gate for log deletions; Kettlebell Swing; Day 2 update.
- **1.0.x** — Core 4-day split + warmup + timer + local autosave + Drive two-way sync.

## Test / dev workflow
```bash
# Local server (recommended — gives a real origin for localStorage + fetch)
python3 -m http.server 8765
# Open http://localhost:8765/index.html

# Syntax-check the inline JS (extract between the <script> that opens the app
# and the last </script> in the file, then node --check):
START=$(grep -n "var standardWarmupList = \[" index.html | head -1 | cut -d: -f1)
END=$(grep -n "</script>" index.html | tail -1 | cut -d: -f1)
sed -n "${START},${END}p" index.html | sed '$ d' > /tmp/app.js
node --check /tmp/app.js
```

Headless-DOM sanity check (jsdom in `/var/folders/t_/dkx509097s3dbl3xhpfmdq980000gn/T/opencode` with `jsdom@22` already installed):
- Load the real HTML with `runScripts: 'dangerously'`.
- `startWorkoutSession('day1')`, `modifyVal('day1_ex1_s1_w', 1, 5)` → expect 1 local log + badge reset.
- Mock `w.fetch` to return a valid `{workout_logs: [...]}` and call `fetchDataFromGDrive(false, 'workout')` → expect `getPersistentLogs().length === 1`.

## Commit / Push
- Remote: `git@github.com:kaavincraig/workout-tracker.git` (SSH since v1.2.0 era).
- Author: `kaavin craig <kaavincraig@gmail.com>`.
- Style: **imperative, single-line, with a concise why**; multi-line body allowed for meaningful changes.
- Force push is fine on `main` (solo repo, history has been rewritten before).

## Common pitfalls
- **The Apps Script must be re-deployed when you change `GoogleAppsScript.gs`.** Saving alone isn't enough — use *Deploy → Manage deployments → ⋯ → Edit → Version: New version → Deploy* to the same `/exec` URL.
- **The `key` query param must match `MY_SECRET_KEY`** in the script. If the client loads but nothing syncs, first suspect the URL/key.
- **`localStorage` is keyed by origin**, so logs saved at `kaavincraig.github.io` won't appear at `localhost:8765` and vice versa.
- **`file://`** — open the app with a local server (`python3 -m http.server`) instead; it makes the Drive form-POST + JSONP work and gives you a stable origin.
- **Hidden-iframe POSTs are fire-and-forget** — the client can't see the response. That's why we added "Verify On Drive" (a GET right after push) and why the "no customs" banner is a heuristic, not proof of success.
- **The `customworkout_indices` list and the per-id `customworkout_*` cache must stay in sync** — `saveCustomWorkout` / `deleteCustomWorkout` / `handleCustomWorkoutsResponse` all touch both.

## Pending / known open
- The `GoogleAppsScript.gs` key check is technically dead weight for anonymous "Anyone" deploys; if the user ever switches to an access-restricted deployment, the client would have to send the `key` (currently it does NOT).
- No cross-device pull on load (by design, to avoid a silent remote wipe) — customs only load on explicit Pull Custom.
- The "Verify On Drive" banner collapses "old Apps Script code" vs. "sign-in redirect" vs. "file empty" into two buckets; tighten if confusion persists.

## Where every important function lives (approx line numbers, v1.3.1)
- `window.APP_VERSION` — index.html:10
- `CATEGORIES` + builder state vars — ~1140
- `startWorkoutSession` / `endWorkoutSession` / `updateTimerUI` — 1386 / 1410 / 1450
- `saveGDriveUrl` / `syncCurrentDataToGDrive(silent, target)` / `fetchDataFromGDrive(silent, target)` / `handleDriveDataResponse` / `handleCustomWorkoutsResponse` / `fetchDataViaJSONP(url, silent, handler)` — 1540 / 1578 / 1639 / 1732 / 1672 / 1758
- `resolveDayId(id)` — 1944 (near top of the "editing" section)
- `markEdited` / `tapDefaultVal` / `flashCardSavedBadge` / `modifyVal` — 1956 / 1987 / 1995 / 2005
- `triggerAutoSave` / `saveSession` — 2063 / 2339
- `renderWorkoutForms` / `renderSetsTiles` — ~2110 / ~2155
- `switchTab` — ~2190
- `initBuilder` / `renderBuilderCatalog` / `toggleBuilderSelection` / `renderBuilderSelection` / `saveCustomWorkout` / `deleteCustomWorkout` / `loadCustomWorkoutPlans` / `pushCustomsToDrive` / `verifyDriveFile` / `debugVerifyCustomsOnDrive` — ~2540 onward
- `deleteSingleLog` / `clearWorkoutHistory` / `renderHistoryLogs` — ~2660 / ~2720 / ~2760
- `downloadUpdatedWorkoutDataJSON` / `downloadCustomWorkoutsJSON` (manual backup exports) — ~2796 / ~2806
- `lastTouchEnd` / saved-URL hydrator / initial-load — 2815+
- **Note:** the `✨ Auto-Save Ready` badge (`#globalAutoSaveBadge` / `.save-indicator`) lives in the **footer** (above the version `<p>`), not the header — `triggerAutoSave` still swaps its text to `💾 Saving...`.
