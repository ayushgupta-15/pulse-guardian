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

health-risk-ai/
  backend/         FastAPI app and services
  frontend-web/    Next.js web dashboard
  frontend-mobile/ Expo mobile app
  simulator/       Vitals simulator

Quick start
-----------

Backend:
  cd backend
  source venv/bin/activate
  python app/main.py

Simulator:
  cd simulator
  python vitals_simulator.py

Web:
  cd frontend-web
  npm run dev
  open http://localhost:3000/

Mobile:
  cd frontend-mobile
  npm start

Notes
-----
- The backend exposes REST endpoints at http://localhost:8000
- The web and mobile apps poll for latest vitals and update live
- The simulator can be configured for normal/warning/critical scenarios
