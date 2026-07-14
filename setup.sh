#!/bin/bash

# AI-Powered Traffic Prediction & Route Planner Setup Script

echo "🌍 Setting up AI-Powered Traffic Prediction & Route Planner..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    echo "   Visit: https://python.org/"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. You'll need it for the database."
    echo "   Install with: sudo apt-get install postgresql postgresql-contrib postgis"
fi

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo "⚠️  Redis is not installed. You'll need it for caching."
    echo "   Install with: sudo apt-get install redis-server"
fi

echo "📦 Installing frontend dependencies..."
npm install

echo "🐍 Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "🔧 Setting up environment variables..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created .env file from template"
    echo "⚠️  Please edit .env file with your API keys"
else
    echo "✅ .env file already exists"
fi

echo "🗄️  Setting up database..."
# Create database if it doesn't exist
createdb traffic_prediction 2>/dev/null || echo "Database might already exist"

echo "🚀 Starting development servers..."

# Function to start servers
start_servers() {
    echo "Starting backend server..."
    cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    
    echo "Starting frontend server..."
    cd .. && npm run dev &
    FRONTEND_PID=$!
    
    echo "✅ Servers started!"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
    echo ""
    echo "Press Ctrl+C to stop all servers"
    
    # Wait for interrupt
    trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
}

# Ask user if they want to start servers
read -p "Do you want to start the development servers now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    start_servers
else
    echo "To start the servers later, run:"
    echo "  Terminal 1: npm run dev"
    echo "  Terminal 2: npm run backend"
fi

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Start Redis server: redis-server"
echo "3. Start PostgreSQL service"
echo "4. Run the development servers"
echo ""
echo "For more information, see README.md"
