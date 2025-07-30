# YXLP Platform Setup Script for Windows
Write-Host "🚀 Setting up YXLP Platform..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    
    # Check Node.js version
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNumber -lt 18) {
        Write-Host "❌ Node.js version 18+ is required. Current version: $nodeVersion" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is available" -ForegroundColor Green
    $dockerAvailable = $true
} catch {
    Write-Host "⚠️  Docker is not installed. Some features may not work." -ForegroundColor Yellow
    $dockerAvailable = $false
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

# Copy environment file
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating environment file..." -ForegroundColor Blue
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Environment file created. Please update .env with your configuration." -ForegroundColor Green
} else {
    Write-Host "✅ Environment file already exists" -ForegroundColor Green
}

# Start Docker services if Docker is available
if ($dockerAvailable) {
    Write-Host "🐳 Starting Docker services..." -ForegroundColor Blue
    docker-compose up -d postgres redis elasticsearch
    
    # Wait for services to be ready
    Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host "✅ Docker services started" -ForegroundColor Green
} else {
    Write-Host "⚠️  Docker not available. Please start database services manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env file with your configuration"
Write-Host "2. Start the development servers:"
Write-Host "   npm run dev:api    # Start backend API"
Write-Host "   npm run dev:web    # Start frontend app"
Write-Host ""
Write-Host "3. Access the application:"
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   API: http://localhost:3001"
Write-Host "   API Docs: http://localhost:3001/api/docs"
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
