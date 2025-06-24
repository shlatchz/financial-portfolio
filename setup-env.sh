#!/bin/bash

# Portfolio Manager - Environment Setup Script
# This script helps you create your .env file from the template

echo "🚀 Portfolio Manager - Environment Setup"
echo "========================================"

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
    echo "❌ Error: .env.example file not found!"
    echo "   Make sure you're running this script from the project root directory."
    exit 1
fi

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  Warning: .env file already exists!"
    read -p "   Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   Setup cancelled."
        exit 0
    fi
fi

# Copy example to .env
cp .env.example .env
echo "✅ Created .env file from .env.example"

echo ""
echo "📝 Next Steps:"
echo "   1. Edit the .env file with your preferred settings (optional)"
echo "   2. You can also provide your Google Sheets API key directly in the UI"
echo "   3. Run 'npm run dev' to start the development server"
echo ""
echo "📖 For detailed configuration help, see:"
echo "   - README.md - Quick setup guide"
echo "   - ENV_GUIDE.md - Detailed environment configuration"
echo "   - setup.md - Step-by-step setup instructions"
echo ""
echo "🎉 Setup complete! Happy investing!" 