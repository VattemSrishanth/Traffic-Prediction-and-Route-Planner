#!/bin/bash
set -e

echo "========================================================"
echo "  Setting up Traffic Prediction and Route Planner"
echo "========================================================"

command -v node >/dev/null 2>&1 || { echo "[ERROR] Node.js is required. Install from https://nodejs.org/"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "[ERROR] Python 3 is required. Install from https://python.org/"; exit 1; }

echo "[1/3] Setting up Frontend (React / Next.js)..."
cd frontend
npm install
cd ..

echo "[2/3] Setting up Backend (Python FastAPI & ML)..."
cd backend
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "Created Python virtual environment in backend/.venv"
fi
source .venv/bin/activate
pip install -r requirements.txt
cd ..

echo "[3/3] Setting up Environment Config..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "Created .env file from template"
fi

echo "========================================================"
echo "  Setup Complete!"
echo "========================================================"
echo "Frontend: cd frontend && npm run dev"
echo "Backend:  cd backend && source .venv/bin/activate && uvicorn main:socket_app --reload"
