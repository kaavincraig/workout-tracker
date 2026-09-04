# FitSid — Feature Roadmap

Suggested features benchmarked against commercial workout trackers (Strong, Hevy, JEFIT, Fitbod, FitNotes), ranked by commercial impact × implementation cost. All are pure client-side (no new dependencies) and build on the existing `workout_master_logs` data.

## Legend
- ✅ **Done** — shipped
- ⬜ **Not started**

---

| # | Feature | Status | Notes |
|---|---|---|---|
| 1 | **Progress charts** — weight/volume per exercise over time | ⬜ | Strong/Hevy's core retention feature. Pure canvas/SVG, no deps. |
| 2 | **PR detection** — flag new maxes, keep PR list | ✅ | Live badge on set tiles + dedicated 🏆 PRs tab. |
| 3 | **Rest timer** — countdown presets between sets | ✅ | Global floating bar, enable in ⚙️ Settings. |
| 4 | **Exercise history** — tap exercise, see all past sessions | ✅ | Bottom-sheet modal with per-set chips + PR stars. |
| 5 | **Body weight + chart** — daily weight, trend toward goal | ⬜ | Serves the 66 → 70 kg target in `personal_vitals.json`. |
| 6 | **Session stats** — est 1RM, total volume, sets done | ✅ | 📊 Stats tab: per-session sets/volume/best est 1RM + all-time summary. |
| 7 | **Progression suggestion** — "last time 105×7 → try 107.5" | ⬜ | Fitbod's hook. Trivial diff of last two logs per exercise. |
| 8 | **Streaks & achievements** — consistency, 50 workouts, etc. | ⬜ | Gamification (FitLife/FitNotes). Cheap from log dates. |
| 9 | **Swap suggestions** — replace with same-muscle alternative | ⬜ | JEFIT strength. Reuses the existing `CATEGORIES` muscle grouping. |
| 10 | **Per-exercise/session notes** — free-text notes per log | ⬜ | Universal. One textarea saved into the log. |

---

## Suggested build order

Group into three waves to maximize cheap wins first (all read existing logs):

### Wave 1 — cheap wins ✅ (already done)
- #2 PR detection
- #3 Rest timer
- #4 Exercise history

### Wave 2 — stats layer
- #6 Session stats ✅
- #7 Progression suggestion
- #5 Body weight + chart

### Wave 3 — engagement / depth
- #1 Progress charts
- #8 Streaks & achievements
- #9 Swap suggestions
- #10 Notes

---

## Done

### v1.6.0 — #6 Session stats
- **📊 Session Stats tab** — new tab between + and 🏆.
  - All-time summary: workouts, total sets, total volume (lbs) + avg volume per logged session.
  - Per-session rows (newest first): sets done, total volume, best estimated 1RM of any loaded set (with the exercise + set that produced it).
  - Engine: `estOneRM` (Epley: `weight × (1 + reps/30)`), `computeSessionStats(log)`, `renderStatsTab`.
  - Bodyweight / zero-rep rows are excluded from volume and 1RM.
  - Read-only; computed on the fly from `workout_master_logs` — no new data, no new dependencies.

### v1.5.0
- **🏆 Personal Records** — new tab. Live badge on set tiles when current set beats prior best; dedicated tab listing each exercise's heaviest set + date. Engine: `getExercisePR` / `getAllPRs` / `heaviestSet` / `getExerciseSessions`. PR = strictly heavier set (or more reps at equal load) vs earlier logged sessions.
- **⏱ Rest Timer** — hidden by default; enable in ⚙️ Settings. Global floating bar with presets (30s / 60s / 90s), haptic + chime on finish. State persists in `localStorage` (`restTimerEnabled`).
- **Exercise history modal** — tap any exercise name on a day tab. Bottom-sheet (mobile) / centered card (desktop). Lists all sessions (newest first), per-set chips, gold ★ on the session's heaviest set, summary of best loaded set + date.
- **⚙️ Settings tab** — new tab, hosts the Rest timer toggle (and future preferences).

See `CONTEXT.md` for the full implementation map and test recipes.
