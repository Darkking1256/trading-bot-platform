# 🚀 Trading Platform React Client

A modern, responsive React-based trading platform with real-time market data, advanced charting, and comprehensive trading functionality.

## ✨ Features

### 🔐 Authentication & Security
- **User Registration & Login** - Secure user authentication with JWT tokens
- **Password Hashing** - Bcrypt password encryption
- **Session Management** - Automatic token validation and refresh
- **Demo Account** - Pre-configured demo account for testing

### 📊 Real-Time Trading Dashboard
- **Live Market Data** - Real-time price updates for major currency pairs
- **Performance Metrics** - P&L tracking, win rate, and account balance
- **Active Positions** - Real-time position monitoring with P&L updates
- **Trade History** - Comprehensive trade log with filtering

### 📈 Advanced Charting
- **Interactive Charts** - Professional candlestick charts with Lightweight Charts
- **Multiple Timeframes** - 1M, 5M, 15M, 30M, 1H, 4H, 1D, 1W
- **Real-Time Updates** - Live price updates and candle formation
- **Responsive Design** - Optimized for desktop and mobile devices

### 💼 Trading Functionality
- **Market Orders** - Buy/Sell orders with real-time execution
- **Stop Loss & Take Profit** - Automatic risk management
- **Order History** - Complete order tracking and status
- **Position Management** - Real-time position monitoring

### 🎨 Modern UI/UX
- **Dark Theme** - Professional dark interface optimized for trading
- **Responsive Design** - Works seamlessly on all device sizes
- **Toast Notifications** - Real-time feedback for user actions
- **Loading States** - Smooth loading animations and transitions

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **React Router** - Client-side routing and navigation
- **Socket.IO Client** - Real-time WebSocket communication
- **Lightweight Charts** - Professional trading chart library
- **Recharts** - Data visualization for performance metrics
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Toast notifications

### Backend Integration
- **Express.js** - RESTful API server
- **Socket.IO** - Real-time bidirectional communication
- **JWT Authentication** - Secure token-based authentication
- **Bcrypt** - Password hashing and security

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trading-platform/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Backend Setup

1. **Install server dependencies**
   ```bash
   cd ../
   npm install
   ```

2. **Start the backend server**
   ```bash
   npm run server
   ```

3. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## 📱 Available Scripts

### Development
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

### Production
```bash
npm run build      # Create optimized production build
npm run serve      # Serve production build locally
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the client directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

### API Configuration
The client automatically connects to the backend API and WebSocket server. Update the URLs in the configuration files if needed:

- `src/hooks/useSocket.js` - WebSocket connection
- `src/hooks/useAuth.js` - API authentication

## 🎯 Demo Account

Use the following credentials to test the platform:

- **Username**: `demo`
- **Password**: `password123`

## 📊 Features in Detail

### Dashboard
- **Account Overview** - Balance, equity, margin, and free margin
- **Market Overview** - Real-time price updates for major pairs
- **Performance Chart** - 30-day equity curve visualization
- **Active Positions** - Current open positions with P&L
- **Recent Trades** - Latest trading activity

### Trading View
- **Interactive Charts** - Professional candlestick charts
- **Symbol Selection** - 14 major currency pairs
- **Timeframe Selection** - 8 different timeframes
- **Order Placement** - Market orders with SL/TP
- **Order History** - Complete order tracking

### Positions
- **Position Overview** - All open positions
- **P&L Tracking** - Real-time profit/loss updates
- **Position Management** - Close and modify positions

### History
- **Trade History** - Complete trading record
- **Performance Analysis** - Win rate and statistics
- **Export Functionality** - Download trade data

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt encryption for passwords
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Client and server-side validation
- **Session Management** - Automatic token refresh

## 📱 Responsive Design

The application is fully responsive and optimized for:

- **Desktop** - Full-featured trading interface
- **Tablet** - Touch-optimized controls
- **Mobile** - Streamlined mobile experience

## 🎨 Customization

### Styling
- **Tailwind CSS** - Easy customization with utility classes
- **Custom CSS** - Additional styles in `src/App.css`
- **Theme Support** - Dark theme optimized for trading

### Components
- **Modular Architecture** - Reusable components
- **Custom Hooks** - Shared logic and state management
- **Context Providers** - Global state management

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The build folder can be deployed to:
- **Netlify** - Drag and drop deployment
- **Vercel** - Git-based deployment
- **AWS S3** - Static website hosting
- **GitHub Pages** - Free hosting for public repos

### Environment Setup
Ensure your production environment has:
- Backend API server running
- WebSocket server accessible
- CORS properly configured
- Environment variables set

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API and external services
├── utils/              # Utility functions
├── App.js              # Main application component
├── App.css             # Global styles
└── index.js            # Application entry point
```

### Code Style
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **React Best Practices** - Functional components and hooks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔮 Future Enhancements

- **Advanced Order Types** - Limit, stop, and conditional orders
- **Technical Indicators** - RSI, MACD, moving averages
- **Portfolio Management** - Multi-account support
- **Social Trading** - Copy trading and leaderboards
- **Mobile App** - React Native mobile application
- **Advanced Analytics** - Performance analysis and reporting

---

**Happy Trading! 🚀**
