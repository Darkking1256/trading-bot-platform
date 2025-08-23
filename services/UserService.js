const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class UserService {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    
    // Create default demo account
    this.createDemoAccount();
  }

  createDemoAccount() {
    const demoUser = {
      id: 'demo-user-001',
      username: 'demo',
      email: 'demo@tradingplatform.com',
      password: bcrypt.hashSync('demo123', 10),
      accountType: 'DEMO',
      balance: 10000,
      leverage: 100,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      preferences: {
        defaultSymbol: 'EURUSD',
        defaultTimeframe: '1H',
        theme: 'dark',
        language: 'en',
        notifications: {
          email: false,
          push: true,
          sound: true
        },
        chartSettings: {
          defaultIndicators: ['SMA', 'RSI'],
          chartType: 'candlestick',
          gridLines: true,
          volume: true
        }
      }
    };

    this.users.set(demoUser.id, demoUser);
    console.log('Demo account created');
  }

  async register(userData) {
    const { username, email, password, accountType = 'DEMO' } = userData;

    // Validate input
    if (!username || !email || !password) {
      throw new Error('Missing required fields');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = Array.from(this.users.values()).find(
      user => user.username === username || user.email === email
    );

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: userId,
      username,
      email,
      password: hashedPassword,
      accountType,
      balance: accountType === 'DEMO' ? 10000 : 0,
      leverage: 100,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      preferences: {
        defaultSymbol: 'EURUSD',
        defaultTimeframe: '1H',
        theme: 'dark',
        language: 'en',
        notifications: {
          email: false,
          push: true,
          sound: true
        },
        chartSettings: {
          defaultIndicators: ['SMA', 'RSI'],
          chartType: 'candlestick',
          gridLines: true,
          volume: true
        }
      }
    };

    this.users.set(userId, newUser);

    return {
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        accountType: newUser.accountType,
        balance: newUser.balance,
        preferences: newUser.preferences
      }
    };
  }

  async login(credentials) {
    const { username, password } = credentials;

    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    // Find user
    const user = Array.from(this.users.values()).find(
      u => u.username === username || u.email === username
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.users.set(user.id, user);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Store session
    this.sessions.set(token, {
      userId: user.id,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        accountType: user.accountType,
        balance: user.balance,
        preferences: user.preferences
      }
    };
  }

  async logout(token) {
    if (this.sessions.has(token)) {
      this.sessions.delete(token);
    }
    return { success: true };
  }

  async authenticate(token) {
    if (!token) {
      throw new Error('No token provided');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const session = this.sessions.get(token);

      if (!session) {
        throw new Error('Session not found');
      }

      const user = this.users.get(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update last activity
      session.lastActivity = new Date().toISOString();
      this.sessions.set(token, session);

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          accountType: user.accountType,
          balance: user.balance,
          preferences: user.preferences
        }
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async updatePreferences(userId, preferences) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Merge preferences
    user.preferences = { ...user.preferences, ...preferences };
    this.users.set(userId, user);

    return {
      success: true,
      preferences: user.preferences
    };
  }

  async updateBalance(userId, newBalance) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.balance = newBalance;
    this.users.set(userId, user);

    return {
      success: true,
      balance: user.balance
    };
  }

  async getUserById(userId) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      accountType: user.accountType,
      balance: user.balance,
      leverage: user.leverage,
      currency: user.currency,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      preferences: user.preferences
    };
  }

  async getAllUsers() {
    return Array.from(this.users.values()).map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      accountType: user.accountType,
      balance: user.balance,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
  }

  async deleteUser(userId) {
    if (!this.users.has(userId)) {
      throw new Error('User not found');
    }

    this.users.delete(userId);
    
    // Remove user sessions
    for (const [token, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(token);
      }
    }

    return { success: true };
  }

  getActiveSessions() {
    return Array.from(this.sessions.entries()).map(([token, session]) => ({
      token: token.substring(0, 20) + '...',
      userId: session.userId,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity
    }));
  }

  cleanupExpiredSessions() {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [token, session] of this.sessions.entries()) {
      const sessionAge = now - new Date(session.lastActivity);
      if (sessionAge > maxAge) {
        this.sessions.delete(token);
      }
    }
  }
}

module.exports = UserService;



