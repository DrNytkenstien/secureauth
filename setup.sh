#!/bin/bash

# SecureAuth Backend - Quick Start Script
# This script sets up the backend project for development

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          SecureAuth Backend - Quick Start Setup           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "⚙️  Creating .env file..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Skipping creation."
else
    # Copy .env.example to .env
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env file created from .env.example"
        echo "   Please edit .env with your configuration"
    else
        echo "⚠️  .env.example not found"
    fi
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete! 🎉                      ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║                                                            ║"
echo "║  Next Steps:                                              ║"
echo "║  1. Configure .env with your settings                     ║"
echo "║  2. Start development server: npm run dev                 ║"
echo "║  3. Server will run on http://localhost:5000              ║"
echo "║                                                            ║"
echo "║  Documentation:                                           ║"
echo "║  - README.md              - API Documentation             ║"
echo "║  - API_TESTING.md         - Testing Examples              ║"
echo "║  - PRODUCTION_CHECKLIST.md - Production Deployment        ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Ask if user wants to start the server
read -p "Would you like to start the development server now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting development server..."
    echo ""
    npm run dev
fi
