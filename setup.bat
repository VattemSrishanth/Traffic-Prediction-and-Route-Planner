@echo off
echo 🌍 Setting up AI-Powered Traffic Prediction ^& Route Planner...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python 3 is not installed. Please install Python 3.9+ first.
    echo    Visit: https://python.org/
    pause
    exit /b 1
)

echo 📦 Installing frontend dependencies...
npm install

echo 🐍 Installing backend dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo 🔧 Setting up environment variables...
if not exist .env (
    copy env.example .env
    echo ✅ Created .env file from template
    echo ⚠️  Please edit .env file with your API keys
) else (
    echo ✅ .env file already exists
)

echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your API keys
echo 2. Start Redis server (if installed)
echo 3. Start PostgreSQL service (if installed)
echo 4. Run the development servers:
echo    Terminal 1: npm run dev
echo    Terminal 2: npm run backend
echo.
echo For more information, see README.md
pause
