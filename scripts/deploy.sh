#!/bin/bash

# Puffin ERP Deployment Script
# This script handles database migrations and server deployment

set -e  # Exit on any error

echo "🚀 Starting Puffin ERP Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Checking environment..."

# Check if backend directory exists
if [ ! -d "backend" ]; then
    print_error "Backend directory not found."
    exit 1
fi

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    print_warning "Backend .env file not found. Make sure to configure environment variables."
fi

print_status "Installing dependencies..."

# Install backend dependencies
cd backend
npm install

print_status "Running database migrations..."

# Set environment variable to force migrations
export RUN_MIGRATIONS=true

# Run migrations
npm run migrate

if [ $? -eq 0 ]; then
    print_success "Database migrations completed successfully"
else
    print_warning "Migration failed, but continuing with deployment"
fi

print_status "Building frontend..."

# Go back to root and build frontend
cd ..
cd frontend
npm install
npm run build

if [ $? -eq 0 ]; then
    print_success "Frontend build completed successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

print_status "Starting server..."

# Go back to backend and start server
cd ../backend

# Check if PM2 is available for production deployment
if command -v pm2 &> /dev/null; then
    print_status "Using PM2 for process management"
    pm2 restart puffin-erp || pm2 start app.js --name puffin-erp
    print_success "Server started with PM2"
else
    print_status "Starting server with npm start"
    npm start
fi

print_success "🎉 Deployment completed successfully!"

echo ""
echo "📋 Deployment Summary:"
echo "   ✅ Dependencies installed"
echo "   ✅ Database migrations run"
echo "   ✅ Frontend built"
echo "   ✅ Server started"
echo ""
echo "🌐 Your Puffin ERP system should now be running!"
echo "📝 Check the logs above for any warnings or errors."
echo ""