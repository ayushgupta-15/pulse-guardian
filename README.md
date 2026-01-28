Health Risk AI
==============

Health Risk AI is a full-stack prototype for real-time patient monitoring and
risk assessment. It includes:

- Backend API (FastAPI) for ingesting vitals and calculating risk scores
- Web dashboard (Next.js) for live patient monitoring
- Mobile app (Expo/React Native) for bedside views and alerts
- Simulator to generate and send synthetic vitals

Repository structure
--------------------

pulse-guardian/
  apps/
    backend/       FastAPI app and services
    web/           Next.js web dashboard
    mobile/        Expo mobile app
    simulator/     Vitals simulator
  packages/        Shared libs (future)
  docs/            Documentation
  scripts/         Helper scripts

Quick start
-----------

Backend:
  cd apps/backend
  source venv/bin/activate
  python app/main.py

Simulator:
  cd apps/simulator
  python vitals_simulator.py

Web:
  cd apps/web
  npm run dev
  open http://localhost:3000/

Mobile:
  cd apps/mobile
  npm start

Notes
-----
- The backend exposes REST endpoints at http://localhost:8000
- The web and mobile apps poll for latest vitals and update live
- The simulator can be configured for normal/warning/critical scenarios
- Large datasets, notebooks, and model artifacts are stored outside git. See docs/data-and-models.md
