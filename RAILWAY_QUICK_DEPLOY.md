# 🚀 Quick Railway Deployment Guide

## Deploy Your Trading Bot to Railway in 5 Minutes

### 1. **Connect to Railway**
- Go to [railway.app](https://railway.app)
- Click "Start a New Project"
- Select "Deploy from GitHub repo"
- Connect your GitHub account
- Select your `trading-bot-platform` repository

### 2. **Add PostgreSQL Database**
- In Railway dashboard, click "New Service"
- Select "Database" → "PostgreSQL"
- Railway will automatically create `DATABASE_URL`

### 3. **Configure Environment Variables**
In your Railway project → Variables tab, add:

```bash
# Required
NODE_ENV=production
PORT=5000
DATABASE_URL=your_railway_postgres_url

# API Keys
ALPHA_VANTAGE_API_KEY=ZG0G1ZPFV2BKDL8A

# Optional (for live trading)
OANDA_API_KEY=your_oanda_key
OANDA_ACCOUNT_ID=your_account_id
```

### 4. **Deploy**
- Railway will automatically detect your app
- It will use the `Dockerfile.railway` for building
- Deployment will start automatically

### 5. **Test Your App**
- Visit your Railway URL: `https://your-app.railway.app`
- Check health: `https://your-app.railway.app/api/health`
- Test trading bot: `https://your-app.railway.app/trading-bot`

## 🎯 What You Get

✅ **Full-stack application** with real-time trading  
✅ **PostgreSQL database** for data persistence  
✅ **WebSocket support** for live price updates  
✅ **Auto-deployment** from GitHub  
✅ **HTTPS by default**  
✅ **Automatic scaling**  

## 🔧 Troubleshooting

### Build Fails?
- Check Railway logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

### Database Connection Issues?
- Make sure PostgreSQL service is running
- Check `DATABASE_URL` is correct
- Verify database is accessible

### WebSocket Not Working?
- Railway supports WebSockets natively
- Check CORS configuration
- Verify client connects to correct URL

## 🚀 Next Steps

After successful deployment:
1. **Test live trading** with real broker APIs
2. **Add authentication** for user management
3. **Monitor performance** with Railway metrics
4. **Scale up** as needed

Your trading bot is now live and ready for real trading! 🎉
