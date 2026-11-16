# CodeArena

Coding-practice platform built from the CodeArena blueprint: React + Vite + TypeScript + Tailwind frontend (`codearena/`) and an Express + SQLite API (`../server/`).

## Run

```
cd ../server && npm install && npm start   # API on :4100 (set JWT_SECRET to keep logins across restarts)
cd ../codearena && npm install && npm run dev   # UI on :5180, proxies /api to :4100
npm test         # unit tests (in each folder)
```

## Implemented

- Auth (register/login, JWT, optional "Continue with Google"), protected routes, admin-only route guard
- Problem explorer (server-side search, filter, pagination), workspace with Monaco editor
- Languages: JavaScript, Python (write `solve()`), Java, C++, C (full programs that read stdin and print JSON)
- 103 problems across 9 levels (basics to dynamic programming); expected outputs are computed from reference solutions in `server/problems/` (format in `SPEC.md`, check with `node problems/validate.js`)
- Run/Submit via API, submission history and detail (owner-only)
- Judge0-backed judging with hidden test cases (server-side only) and a 10-submissions-per-minute limit
- Admin problem editor (create/edit problems, examples and hidden tests); promote a user with `node promote.js <username>` in `server/`
- Dashboard, leaderboard and profile read real data from the API (no streaks or daily goals yet)

## Planned (not implemented)

- **Judge0 setup required.** Code runs only on a Judge0 instance (`JUDGE0_URL`, optional `JUDGE0_KEY` env vars on the server); without it every verdict is "System Error". Not yet verified against a live Judge0.
- Streaks, goals and period-based leaderboards
- Tokens are stored in localStorage; consider httpOnly cookies before production.

## Google sign-in (optional)

1. Google Cloud Console, APIs & Services, Credentials: create an **OAuth client ID** of type *Web application*.
2. Add **http://localhost:5190** under *Authorized JavaScript origins* (and your production origin later).
3. Start the server with `GOOGLE_CLIENT_ID=<that id>` set. No client secret is needed. Without it the button is hidden.

The server verifies Google's ID token, then signs the user in (or creates the account) by verified email.
