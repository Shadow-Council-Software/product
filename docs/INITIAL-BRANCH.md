# `initial` branch

**Purpose:** Single branch containing **all product work** committed in **documented groups** (see [`GIT-HISTORY.md`](./GIT-HISTORY.md)).

This is a **read-only style snapshot** for audit and onboarding—not the branch for day-to-day BMad runs. Use `product/<slug>` with BMad `planning_artifacts` pointed at that product folder.

**Tip:** `git log initial --oneline --reverse` walks groups G2→G10 in apply order after G1 (main merge-base).
