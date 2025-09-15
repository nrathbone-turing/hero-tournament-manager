# Hero Tournament Manager
> Project 2 of Flatiron Capstone – Full-stack web application for managing hero/villain tournaments.

---

## Overview
Following [Hero vs Villain Showdown](https://github.com/nrathbone-turing/hero-vs-villain-rps-showdown) (Project 1, a frontend React app using the [SuperHero API](https://superheroapi.com/)), this project pivots into a full-stack productivity tool. Instead of one-off battles, the focus is on organizing tournaments: creating events, registering entrants, logging matches, and displaying standings.

This keeps the hero/villain theme while addressing a distinct problem: managing group play efficiently.

Technologies introduced:
- Flask + PostgreSQL backend
- Relational data models + migrations
- React frontend with CRUD integration
- (Stretch) AI for roster suggestions and tournament summaries

---

## Features
- Create and manage tournaments (Events)
- Register entrants and aliases
- Log match results and winners
- View live standings and leaderboards
- Stretch Goals:
  - AI seeding and roster completion
  - AI-generated event recaps
  - Analytics dashboards (win rates, meta trends)

---

## Screenshots
Screenshots will be added once frontend components are built

---

## Architecture
### Backend
- Flask + SQLAlchemy + PostgreSQL
- Migrations with Flask-Migrate
- Models:
  - `Event`: name, date, rules, status
  - `Entrant`: player name, alias, event_id (FK)
  - `Match`: event_id (FK), round, entrants, scores, winner
  - (Stretch) `Feedback`: notes, match_id (FK), AI summarization target

### Frontend
- React (CRA) with React Router
- Components:
  - Event Dashboard
  - Event Detail (Entrants + Matches tabs)
  - Match Entry Form
  - Standings/Leaderboard View
- Styling: Semantic UI or Tailwind

---

## Tech Stack
- **Backend:** Flask, SQLAlchemy, PostgreSQL, Flask-Migrate
- **Frontend:** React, React Router, fetch API, Semantic UI/Tailwind
- **DevOps:** GitHub for version control, deployment targets (Render/Heroku/GitHub Pages/Google Cloud)
  - Flake8 (linting)
  - Black (auto-formatting)
- **Testing:** pytest (backend), React Testing Library (frontend)

---

## Installation & Setup
### 1. Backend Setup
```
cd backend
source ../venv/bin/activate   # activate virtual env
pip install -r requirements.txt
flask db upgrade               # run migrations
flask run
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
- Standard dependencies are in `backend/requirements.txt`
- Dev-only dependencies (linting, formatting, pytest) are in `requirements-dev.txt`

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
- CRUD for Events
- CRUD for Matches (linked to Events/Entrants)
- Read-only endpoint for aggregated standings
- (Stretch) AI endpoints (roster suggestions, recap summaries)

---

## Project Structure
```
## Project Structure

hero-tournament-manager/
├── backend/                # Flask backend (API + models + routes + tests)
│   ├── app.py
│   ├── config.py
│   ├── models.py
│   ├── requirements.txt
│   ├── routes/
│   │   ├── events.py
│   │   ├── entrants.py
│   │   └── matches.py
│   └── tests/
│       ├── test_models.py
│       ├── test_routes_events.py
│       ├── test_routes_entrants.py
│       └── test_routes_matches.py
│
├── frontend/               # React frontend
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── index.js
│       ├── index.css
│       ├── components/
│       │   └── EventDashboard.jsx
│       └── __tests__/
│           ├── App.test.jsx
│           └── EventDashboard.test.jsx
│
├── venv/                   # Python virtual environment (ignored in Git)
├── requirements-dev.txt    # Dev-only Python deps (pytest, flake8, black)
├── package.json            # Root-level scripts (lint/test orchestration)
├── pyproject.toml          # Config for tools like Black
├── pytest.ini              # Pytest config
├── README.md               # Project docs
└── LICENSE                 # License file
```

## Future Improvements
- Authentication + user accounts (planned for Project 3)
- Bracket auto-generation algorithms
- Expanded analytics (deck matchups, trend graphs)
- Multiplayer support

---

## About This Repo
**Author:** Nick Rathbone | [GitHub Profile](https://github.com/nrathbone-turing)

This project is part of the Flatiron School Capstone course.

**Notes:**
- AI features are stretch goals; core CRUD MVP first
- Deployment target undecided
- Refactor entrant model to be global (or tied to users) with an event_entrants join table, so entrants can participate in multiple events

**License:** MIT — feel free to use or remix!