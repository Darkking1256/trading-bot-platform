#!/bin/bash

# 🚀 Trading Bot Platform Deployment Script
# This script helps you deploy the trading bot platform to GitHub

echo "🤖 Trading Bot Platform - Deployment Script"
echo "=============================================="

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

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_warning "Node.js is not installed. You'll need it for local development."
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_warning "npm is not installed. You'll need it for local development."
fi

print_status "Starting deployment process..."

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    print_error "GitHub username is required!"
    exit 1
fi

# Get repository name
read -p "Enter repository name (default: trading-bot-platform): " REPO_NAME
REPO_NAME=${REPO_NAME:-trading-bot-platform}

print_status "Repository will be: $GITHUB_USERNAME/$REPO_NAME"

# Check if git repository is already initialized
if [ ! -d ".git" ]; then
    print_status "Initializing git repository..."
    git init
    print_success "Git repository initialized"
else
    print_status "Git repository already exists"
fi

# Check if remote origin already exists
if git remote get-url origin &> /dev/null; then
    print_warning "Remote origin already exists. Do you want to update it? (y/n)"
    read -p "" UPDATE_REMOTE
    if [[ $UPDATE_REMOTE =~ ^[Yy]$ ]]; then
        git remote remove origin
    else
        print_status "Keeping existing remote origin"
    fi
fi

# Add remote origin if it doesn't exist
if ! git remote get-url origin &> /dev/null; then
    print_status "Adding GitHub remote origin..."
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    print_success "Remote origin added"
fi

# Update README with correct GitHub username
print_status "Updating README with your GitHub username..."
sed -i "s/yourusername/$GITHUB_USERNAME/g" README.md
print_success "README updated"

# Add all files
print_status "Adding files to git..."
git add .
print_success "Files added to git"

# Create initial commit
print_status "Creating initial commit..."
git commit -m "Initial commit: Advanced Trading Bot Platform

🤖 Features:
- Multi-strategy trading bot engine
- Real-time market data and signals
- Advanced risk management
- Social trading features
- Professional UI/UX
- Mobile responsive design

📊 Trading Strategies:
- Moving Average Crossover
- RSI Divergence
- Bollinger Bands

🛡️ Risk Management:
- Position sizing
- Stop-loss/take-profit
- Portfolio monitoring
- Risk alerts

🚀 Ready for testing and deployment!"
print_success "Initial commit created"

# Push to GitHub
print_status "Pushing to GitHub..."
if git push -u origin main; then
    print_success "Successfully pushed to GitHub!"
else
    print_error "Failed to push to GitHub. Please check your credentials and repository access."
    exit 1
fi

# Create GitHub repository if it doesn't exist
print_status "Checking if GitHub repository exists..."
if ! curl -s "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME" | grep -q '"id"'; then
    print_warning "Repository doesn't exist on GitHub. Please create it manually:"
    echo "1. Go to https://github.com/new"
    echo "2. Repository name: $REPO_NAME"
    echo "3. Description: Advanced algorithmic trading platform with automated trading bots"
    echo "4. Make it Public"
    echo "5. Don't initialize with README (we already have one)"
    echo "6. Click 'Create repository'"
    echo ""
    read -p "Press Enter after creating the repository..."
fi

# Final success message
echo ""
echo "🎉 Deployment completed successfully!"
echo "======================================"
echo ""
echo "📋 Next Steps:"
echo "1. Visit: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "2. Share the repository with others"
echo "3. Set up deployment platforms (see DEPLOYMENT_GUIDE.md)"
echo "4. Configure environment variables"
echo "5. Start testing the trading bots!"
echo ""
echo "🚀 Quick Deploy Options:"
echo "- Heroku: heroku create && git push heroku main"
echo "- Railway: Connect repository at railway.app"
echo "- Render: Connect repository at render.com"
echo "- Vercel: Import repository at vercel.com"
echo ""
echo "📚 Documentation:"
echo "- README.md - Main documentation"
echo "- DEPLOYMENT_GUIDE.md - Detailed deployment instructions"
echo "- ALGORITHMIC_TRADING_README.md - Trading bot documentation"
echo ""
echo "🤝 Community:"
echo "- Create GitHub Issues for bugs"
echo "- Start GitHub Discussions for questions"
echo "- Share your experience with the community"
echo ""
print_success "Happy trading! 🤖📈"

# Optional: Open GitHub repository in browser
read -p "Would you like to open the GitHub repository in your browser? (y/n): " OPEN_BROWSER
if [[ $OPEN_BROWSER =~ ^[Yy]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    elif command -v open &> /dev/null; then
        open "https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    elif command -v start &> /dev/null; then
        start "https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    else
        print_warning "Could not open browser automatically. Please visit:"
        echo "https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    fi
fi
