# Hero Tournament Manager
> Project 2 of Flatiron Capstone – Full-stack web application for managing hero/villain tournaments.

---

## Overview
Following [Hero vs Villain Showdown](https://github.com/nrathbone-turing/hero-vs-villain-rps-showdown) (Project 1, a frontend React app using the [SuperHero API](https://superheroapi.com/)), this project pivots into a full-stack productivity tool. Instead of one-off battles, the focus is on organizing tournaments: creating events, registering entrants, logging matches, and displaying standings.

This keeps the hero/villain theme while addressing a distinct problem: managing group play efficiently.

Technologies introduced:
- Flask + SQLAlchemy + PostgreSQL backend
- Relational data models + migrations + seed scripts
- React frontend with CRUD integration + routing
- Dynamic entrant counts & match winner resolution
- Scrollable UI components for long lists
- (Stretch) AI for roster suggestions and tournament summaries

---

## Features
- **Events**
  - Create, update, delete tournaments
  - Statuses: Drafting, Published, Cancelled, Completed
- **Entrants**
  - Register with name + alias
  - Remove entrants dynamically
  - Entrant counts shown on the dashboard
- **Matches**
  - Log results with scores and winners
  - Winner display dynamically resolves to entrant names
  - Support for incremental rounds seeded via JSON
- **UI Enhancements**
  - Scrollable lists (events, entrants, matches)
  - Placeholder hero images for flair (planned to wire to Project 1 API)
- **Authentication & Authorization**
  - Users can register/login
  - Session or JWT-based auth
  - Ownership enforcement (users can only update/delete their own data)
  - (In progress — core requirement of Project 2)
- **Stretch Goals**
  - AI seeding and roster completion
  - AI-generated event recaps
  - Analytics dashboards (win rates, meta trends)

---

## Screenshots
*(latest examples)*  

- **Event Dashboard (with entrant counts & scroll)**  
- **Event Detail (Entrants + Matches in sortable tables)**  

---

## Architecture
### Backend
- Flask + SQLAlchemy + PostgreSQL
- Migrations with Flask-Migrate
- Models:
  - `Event`: name, date, rules, status
  - `Entrant`: player name, alias, event_id (FK)
  - `Match`: event_id (FK), round, entrants, scores, winner
- Seed scripts: `events.json`, `entrants.json`, `matches.json` with incremental rounds + scores
- Routes: CRUD for events, entrants, matches

### Frontend
- React + React Router
- Components:
  - `EventDashboard` (event creation + list with entrant counts)
  - `EventDetail` (entrants + matches, tabs for add/remove)
  - `EntrantDashboard` (sub-form for entrants)
  - `MatchDashboard` (sub-form for matches)
- UI:
  - Material UI (MUI) with custom scrollbar styling
  - Responsive 3-column layout for event detail view

---

## Tech Stack
- **Backend:** Flask, SQLAlchemy, PostgreSQL, Flask-Migrate
- **Frontend:** React, React Router, fetch API, Material UI
- **DevOps:** GitHub for version control  
  - Flake8 (linting, backend)  
  - Black (auto-formatting, backend)  
  - ESLint + Prettier (frontend)  
- **Testing:**  
  - `pytest` (backend)  
  - React Testing Library (frontend)

---

## Installation & Setup
### 1. Backend Setup
```
cd backend
source ../venv/bin/activate   # activate virtual env
pip install -r requirements.txt
flask db upgrade               # run migrations
flask run --port=5500
```

### 2. Frontend Setup
```
cd frontend
npm install
npm start
```
*(Frontend dev server runs at http://localhost:3000, backend runs at http://localhost:5500)*

---

## Development Tools
### Backend Linting & Formatting
- **Lint (check code style):**
```
npm run lint:backend
```
- **Format (auto-fix code style):**
```
npm run format:backend
```
- **One-step fix (format then lint):**
```
npm run fix:backend
```
These commands use [Flake8](https://flake8.pycqa.org/) for linting and [Black](https://black.readthedocs.io/) for auto-formatting.

### Frontend Linting & Formatting
- **Lint (check code style):**
```
npm run lint:frontend
```
- **Format (auto-fix code style):**
```
npm run format:frontend
```
- **One-step fix (format then lint):**
```
npm run fix:frontend
```
These commands use [ESLint](https://eslint.org/) for linting and [Prettier](https://prettier.io/) for formatting.

### Requirements
- Runtime dependencies: `backend/requirements.txt`
- Dev dependencies (linting, formatting, pytest): `requirements-dev.txt`

Install both when working locally:
```
pip install -r backend/requirements.txt
pip install -r requirements-dev.txt
```

---

## Running Tests
### Backend Tests (pytest)
```
npm run test:backend
```

### Frontend Tests (Jest & RTL)
```
npm run test:frontend
```

### Full Suite (backend + frontend)
```
npm test
```

--- 

## API Endpoints
- **Events**: Create, list (with entrant counts), update, delete
- **Entrants**: Add, remove per event
- **Matches**: Add, update scores + winner
- **Future**: read-only standings, AI endpoints

---

## Project Structure
```
.
├── backend                        # Flask backend (API, models, routes, seeds, tests)
│   ├── __init__.py                # Marks backend as a Python package
│   ├── app.py                     # Flask app factory / entry point
│   ├── config.py                  # Configuration (DB URI, env settings)
│   ├── migrations                 # Alembic migration history
│   │   ├── alembic.ini
│   │   ├── env.py
│   │   ├── README
│   │   ├── script.py.mako
│   │   └── versions               # Individual migration scripts
│   ├── models.py                  # SQLAlchemy models (Event, Entrant, Match)
│   ├── requirements.txt           # Backend runtime dependencies
│   ├── routes                     # Flask Blueprints (API endpoints)
│   │   ├── __init__.py
│   │   ├── entrants.py
│   │   ├── events.py
│   │   └── matches.py
│   ├── scripts                    # Utility scripts
│   │   ├── clear_db.py            # Reset database
│   │   ├── seed_db.py             # Seed database with sample data
│   │   └── seed.js                # (Optional/legacy) JS-based seeding
│   ├── seeds                      # JSON seed files
│   │   ├── entrants.json
│   │   ├── events.json
│   │   └── matches.json
│   ├── server.js                  # (Scratch/utility) Node backend test file
│   └── tests                      # Backend tests (pytest + API smoke tests)
│       ├── api.test.js            # Node-based API test (legacy/supplemental)
│       ├── conftest.py            # pytest fixtures
│       ├── test_models.py
│       ├── test_routes_entrants.py
│       ├── test_routes_events.py
│       └── test_routes_matches.py
│
├── frontend                       # React frontend
│   ├── package-lock.json
│   ├── package.json
│   ├── public                     # Static assets
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── README.md                  # CRA default README (frontend only)
│   └── src                        # React source code
│       ├── __tests__              # Frontend Jest/RTL tests
│       │   ├── App.test.jsx
│       │   ├── EntrantDashboard.test.jsx
│       │   ├── EventDashboard.test.jsx
│       │   ├── EventDetail.test.jsx
│       │   └── MatchDashboard.test.jsx
│       ├── api.js                 # Fetch API helper functions
│       ├── App.css
│       ├── App.jsx                # Root component
│       ├── components             # Core feature components
│       │   ├── EntrantDashboard.jsx
│       │   ├── EventDashboard.jsx
│       │   ├── EventDetail.jsx
│       │   └── MatchDashboard.jsx
│       ├── index.css
│       ├── index.js               # React entry point
│       ├── setupTests.js          # Jest setup
│       └── test-utils.js          # Custom RTL helpers
│
├── instance                       # Flask instance folder
│   └── tournaments.db             # SQLite DB (local dev)
│
├── LICENSE                        # MIT License
├── package.json                   # Root-level scripts (lint/test orchestration)
├── pyproject.toml                  # Config for Black + tooling
├── pytest.ini                      # pytest config
├── README.md                       # Project README (this file)
└── requirements-dev.txt            # Dev-only Python deps (pytest, flake8, black)
```

## Future Improvements
- Bracket auto-generation algorithms
- Expanded analytics (deck matchups, trend graphs)
- Multiplayer support
- Global entrants model (via join table) so same hero can appear in multiple events

---

## About This Repo
**Author:** Nick Rathbone | [GitHub Profile](https://github.com/nrathbone-turing)

This project is part of the Flatiron School Capstone course.

**Notes:**
- Current MVP: full CRUD for events, entrants, and matches with dynamic counts + winners
- Deployment target TBD

**License:** MIT — feel free to use or remix!