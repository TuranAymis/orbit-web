# Orbit web E2E suite

The suite runs Chromium in three projects: desktop Chrome at 1280×800, Pixel 7, and iPhone 13 emulation with Chromium. Use Node 20. It expects a separately running FastAPI backend at `http://127.0.0.1:8000`; Playwright starts Vite on port 5173.

## Local setup

From the ORBIT workspace:

```sh
docker run --rm --name orbit-e2e-postgres -e POSTGRES_PASSWORD=pw -e POSTGRES_DB=orbit_t -p 55432:5432 -d postgres:16
cd orbit-backend
python3.12 -m venv .venv
.venv/bin/pip install -r requirements.txt
./scripts/e2e_db.sh
DATABASE_URL=postgresql+psycopg://postgres:pw@localhost:55432/orbit_t BACKEND_CORS_ORIGINS=http://127.0.0.1:5173,http://localhost:5173 .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Keep uvicorn running. In a second terminal:

```sh
cd orbit-web
source ~/.nvm/nvm.sh && nvm use 20
npm install
npx playwright install chromium
npm run test:e2e
```

`npm install` updates `package-lock.json` for the approved `@playwright/test` dev dependency. Commit that generated lockfile update separately when ready. `npm run test:e2e:ui` opens the Playwright UI. Results are written to `playwright-report/`.

The helper uses `E2E_DATABASE_URL` when set; otherwise it connects to the temporary Docker database shown above. The four local seed accounts (`free`, `paid`, `moderator`, and `admin` at `@orbit.local`) use password `123456`. The chat spec joins the paid account to the free account's seeded Orbit Builders group through the Groups UI. The seeded Founder Office Hours event has Istanbul coordinates for the distance test. E2E messages use unique UUIDs, and the preference test restores its original setting.

The database is an isolated test database. Stop the container with `docker stop orbit-e2e-postgres` when done.
