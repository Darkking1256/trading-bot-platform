const { User, Account } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class UserService {
  // Create new user
  static async createUser(userData) {
    try {
      const user = await User.create(userData);
      
      // Create default demo account for new user
      await Account.create({
        userId: user.id,
        accountNumber: `ACC${Date.now()}`,
        accountType: 'demo',
        balance: 10000.00,
        equity: 10000.00,
        freeMargin: 10000.00,
        currency: 'USD',
        leverage: 100
      });
      
      return user.toJSON();
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Username or email already exists');
      }
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const user = await User.findByPk(id, {
        include: [{
          model: Account,
          as: 'accounts'
        }]
      });
      return user ? user.toJSON() : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const user = await User.findOne({
        where: { email },
        include: [{
          model: Account,
          as: 'accounts'
        }]
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const user = await User.findOne({
        where: { username },
        include: [{
          model: Account,
          as: 'accounts'
        }]
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Authenticate user
  static async authenticate(email, password) {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Update last login
      await user.update({ lastLogin: new Date() });

      return user.toJSON();
    } catch (error) {
      throw error;
    }
  }

  // Generate JWT token
  static generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
  }

  // Update user
  static async updateUser(id, updateData) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove sensitive fields from update
      delete updateData.password;
      delete updateData.email; // Email should be updated through separate process
      delete updateData.role; // Role should be updated by admin only

      await user.update(updateData);
      return user.toJSON();
    } catch (error) {
      throw error;
    }
  }

  // Change password
  static async changePassword(id, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error('User not found');
      }

      const isValidPassword = await user.validatePassword(currentPassword);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      user.password = newPassword;
      await user.save();

      return { message: 'Password updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Get user profile with accounts and stats
  static async getUserProfile(id) {
    try {
      const user = await User.findByPk(id, {
        include: [{
          model: Account,
          as: 'accounts',
          include: [{
            model: require('../models/Trade'),
            as: 'trades',
            where: { status: 'OPEN' },
            required: false
          }]
        }]
      });

      if (!user) {
        throw new Error('User not found');
      }

      const profile = user.toJSON();
      
      // Calculate account statistics
      profile.accounts = profile.accounts.map(account => {
        const openTrades = account.trades || [];
        const totalPnL = openTrades.reduce((sum, trade) => sum + parseFloat(trade.profit || 0), 0);
        
        return {
          ...account,
          openPositions: openTrades.length,
          unrealizedPnL: totalPnL,
          totalPnL: parseFloat(account.equity) - parseFloat(account.balance) + totalPnL
        };
      });

      return profile;
    } catch (error) {
      throw error;
    }
  }

  // Get all users (admin only)
  static async getAllUsers(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const { count, rows } = await User.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [{
          model: Account,
          as: 'accounts'
        }]
      });

      return {
        users: rows.map(user => user.toJSON()),
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete user (admin only)
  static async deleteUser(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error('User not found');
      }

      await user.destroy();
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Update user preferences
  static async updatePreferences(id, preferences) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error('User not found');
      }

      const updatedPreferences = {
        ...user.preferences,
        ...preferences
      };

      await user.update({ preferences: updatedPreferences });
      return user.toJSON();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;



