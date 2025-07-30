#!/bin/bash

# YXLP Platform Setup Script
echo "🚀 Setting up YXLP Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Some features may not work."
else
    echo "✅ Docker is available"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "✅ Environment file created. Please update .env with your configuration."
else
    echo "✅ Environment file already exists"
fi

# Start Docker services if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "🐳 Starting Docker services..."
    docker-compose up -d postgres redis elasticsearch
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    echo "✅ Docker services started"
else
    echo "⚠️  Docker not available. Please start database services manually."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Start the development servers:"
echo "   npm run dev:api    # Start backend API"
echo "   npm run dev:web    # Start frontend app"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:3001"
echo "   API Docs: http://localhost:3001/api/docs"
echo ""
echo "Happy coding! 🚀"
