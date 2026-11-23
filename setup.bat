@echo off
echo ========================================================
echo   Setting up Traffic Prediction and Route Planner
echo ========================================================

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python 3 is not installed. Please install Python 3.9+ first.
    echo Visit: https://python.org/
    pause
    exit /b 1
)

echo [1/3] Setting up Frontend (React / Next.js)...
cd frontend
call npm install
cd ..

echo [2/3] Setting up Backend (Python FastAPI & ML)...
cd backend
if not exist .venv (
    python -m venv .venv
    echo Created Python virtual environment in backend/.venv
)
call .venv\Scripts\activate
pip install -r requirements.txt
cd ..

echo [3/3] Setting up Environment Config...
if not exist .env (
    copy env.example .env
    echo Created .env file from template
)

echo.
echo ========================================================
echo   Setup Complete!
echo ========================================================
echo To start developing:
echo   Frontend: cd frontend ^&^& npm run dev       (http://localhost:3000)
echo   Backend:  cd backend ^&^& uvicorn main:socket_app --reload (http://localhost:8000)
echo ========================================================
pause
