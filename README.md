# Krit — Screenshot Design Critique Platform

A full-stack web application for screenshot-based UI/UX feedback and AI-assisted design critique.

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS (deployed on Vercel)
- **Backend**: Node.js + Express (deployed on Render)
- **Database & Storage**: Supabase
- **AI**: OpenRouter (vision-capable model)

## Project Structure

```
trimester_project/
├── frontend/       # React + Vite app (feature/jalal)
├── backend/        # Express API server (feature/ilknur)
├── CREATE.md       # Product specification
└── README.md
```

## Getting Started

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Backend
```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_SERVICE_ROLE_KEY and OPENROUTER_API_KEY
npm install
npm run dev
```

## Git Workflow

- `main` — production-ready code
- `dev` — integration branch (PRs merge here first)
- `feature/jalal` — frontend development
- `feature/ilknur` — backend development

Both contributors must create pull requests to merge into `dev`.

## Team

- **Jalal** — Frontend (React pages, components, routing, Supabase Auth client)
- **Ilknur** — Backend (Express API, DB operations, OpenRouter AI, storage)