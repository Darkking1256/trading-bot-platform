# 🚀 **Trading Bot Setup Guide**

## **Step 1: Install Node.js**

### **Windows Installation:**
1. **Download Node.js** from: https://nodejs.org/
2. **Choose LTS version** (recommended)
3. **Run the installer** as administrator
4. **Follow the setup wizard** (accept all defaults)
5. **Restart your computer** or at least restart PowerShell

### **Verify Installation:**
Open a new PowerShell window and run:
```bash
node --version
npm --version
```

You should see version numbers like `v18.17.0` and `9.6.7`

## **Step 2: Install Bot Dependencies**

Once Node.js is installed, navigate to your bot folder and run:

```bash
# Navigate to your bot directory
cd C:\Users\elamu\Desktop\lolo\mt5

# Install dependencies
npm install

# Install additional required packages
npm install axios ws technicalindicators moment uuid dotenv
```

## **Step 3: Set Up Environment Variables**

Create a `.env` file in your bot directory:

```env
# OANDA Demo Account (Recommended to start)
OANDA_API_KEY=your_oanda_api_key_here
OANDA_ACCOUNT_ID=your_oanda_account_id_here

# Optional: FXCM Demo Account
FXCM_API_KEY=your_fxcm_api_key_here
FXCM_ACCOUNT_ID=your_fxcm_account_id_here
```

## **Step 4: Get Broker API Keys**

### **OANDA Demo Account (Recommended):**
1. Go to: https://www.oanda.com/
2. Click "Open Demo Account"
3. Fill out the registration form
4. After account creation, go to "My Account" → "API Access"
5. Generate an API key
6. Note your Account ID

### **FXCM Demo Account (Alternative):**
1. Go to: https://www.fxcm.com/
2. Click "Open Demo Account"
3. Follow the registration process
4. Get API credentials from your account dashboard

## **Step 5: Run the Bot**

### **Demo Mode (Recommended):**
```bash
# Run OANDA demo account
node example.js demo
```

### **Backtesting Mode:**
```bash
# Run backtesting
node example.js backtest
```

### **Live Trading (DANGEROUS!):**
```bash
# Only after extensive testing!
node example.js live
```

## **Step 6: Monitor the Bot**

The bot will show:
- Connection status
- Real-time price updates
- Trading signals
- Performance metrics
- Account balance

## **Quick Start Commands:**

```bash
# 1. Install Node.js (from https://nodejs.org/)

# 2. Open PowerShell as Administrator
# 3. Navigate to bot directory
cd C:\Users\elamu\Desktop\lolo\mt5

# 4. Install dependencies
npm install
npm install axios ws technicalindicators moment uuid dotenv

# 5. Create .env file with your API keys

# 6. Run demo bot
node example.js demo
```

## **Troubleshooting:**

### **"npm is not recognized"**
- Node.js not installed or not in PATH
- Restart PowerShell after installation
- Try restarting your computer

### **"Module not found"**
- Run `npm install` again
- Check if all dependencies are installed

### **"API key invalid"**
- Verify your API key is correct
- Check if your broker account is active
- Ensure you're using demo credentials for testing

## **Safety First:**

⚠️ **IMPORTANT WARNINGS:**
- **Always start with demo accounts**
- **Never use real money until extensively tested**
- **Start with small position sizes (0.01 lots)**
- **Monitor the bot closely**
- **Have emergency stop procedures**

## **Next Steps:**

1. **Install Node.js** from https://nodejs.org/
2. **Get OANDA demo account** and API key
3. **Install dependencies** with `npm install`
4. **Run demo mode** with `node example.js demo`
5. **Monitor performance** and learn the system
6. **Only then consider live trading**

---

**Need Help?** Check the main README file for detailed documentation and troubleshooting tips.







