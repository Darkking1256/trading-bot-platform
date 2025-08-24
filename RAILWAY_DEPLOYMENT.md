# Railway Deployment Guide

## 🚀 Deploy Your Trading Bot to Railway

Railway is perfect for trading bots because it supports:
- ✅ Full-stack applications (frontend + backend)
- ✅ Real-time WebSockets
- ✅ PostgreSQL databases
- ✅ Environment variables
- ✅ Auto-deployment from GitHub

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be on GitHub
3. **PostgreSQL Database**: We'll add this on Railway

## 🚀 Step-by-Step Deployment

### 1. Connect to Railway

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account
5. Select your `trading-bot-platform` repository

### 2. Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```bash
# Database Configuration
DATABASE_URL=your_railway_postgres_url

# API Keys
ALPHA_VANTAGE_API_KEY=ZG0G1ZPFV2BKDL8A

# Server Configuration
PORT=5000
NODE_ENV=production

# Optional: Broker API Keys (for live trading)
OANDA_API_KEY=your_oanda_key
OANDA_ACCOUNT_ID=your_account_id
FXCM_API_KEY=your_fxcm_key
ALPACA_API_KEY=your_alpaca_key
```

### 3. Add PostgreSQL Database

1. In Railway dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a `DATABASE_URL` environment variable
4. Your app will automatically connect to this database

### 4. Deploy

1. Railway will automatically detect your Node.js app
2. It will install dependencies and build your application
3. The deployment will start automatically

### 5. Configure Custom Domain (Optional)

1. Go to your service → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## 🔧 Post-Deployment Configuration

### Update Client Environment

Once deployed, update your `client/.env` with the Railway URL:

```bash
# Production (Railway)
VITE_API_BASE=https://your-railway-app.railway.app
VITE_SOCKET_URL=https://your-railway-app.railway.app
VITE_DEMO_MODE=false
```

### Test Your Deployment

1. **Health Check**: Visit `https://your-app.railway.app/api/health`
2. **Trading Bot**: Visit `https://your-app.railway.app/trading-bot`
3. **WebSocket Test**: Check browser console for connection status

## 🎯 Benefits of Railway Deployment

### ✅ **Real-time Trading**
- WebSocket connections work perfectly
- Live price updates and trade execution
- Real-time performance metrics

### ✅ **Database Integration**
- PostgreSQL for storing trades, users, and performance data
- Automatic database migrations
- Data persistence across deployments

### ✅ **Scalability**
- Automatic scaling based on traffic
- Load balancing
- High availability

### ✅ **Security**
- Environment variables for API keys
- HTTPS by default
- Secure database connections

## 🔍 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check Railway logs for dependency issues
   - Ensure `package.json` has correct scripts

2. **Database Connection**
   - Verify `DATABASE_URL` is set correctly
   - Check if PostgreSQL service is running

3. **WebSocket Issues**
   - Ensure Railway supports WebSockets (it does)
   - Check CORS configuration

4. **Environment Variables**
   - Verify all required variables are set
   - Check for typos in variable names

## 📊 Monitoring

Railway provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, and network usage
- **Alerts**: Automatic notifications for issues
- **Health Checks**: Automatic monitoring of your app

## 🚀 Next Steps

After successful deployment:

1. **Test Live Trading**: Connect real broker APIs
2. **Add Users**: Implement authentication
3. **Monitor Performance**: Set up alerts and monitoring
4. **Scale**: Add more trading strategies and features

Your trading bot will now be fully functional with real-time capabilities! 🎉
