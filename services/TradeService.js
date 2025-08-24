const { Trade, Account, User, Strategy } = require('../models');
const { Op } = require('sequelize');

class TradeService {
  // Create new trade
  static async createTrade(tradeData) {
    try {
      // Validate account exists and has sufficient margin
      const account = await Account.findByPk(tradeData.accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      // Check if account can open position
      if (!account.canOpenPosition(tradeData.lotSize, tradeData.symbol)) {
        throw new Error('Insufficient margin to open position');
      }

      // Generate unique ticket
      const ticket = `T${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      const trade = await Trade.create({
        ...tradeData,
        ticket,
        currentPrice: tradeData.openPrice
      });

      // Update account margin
      const requiredMargin = account.calculateRequiredMargin(tradeData.lotSize, tradeData.symbol);
      await account.update({
        margin: parseFloat(account.margin) + requiredMargin,
        freeMargin: parseFloat(account.freeMargin) - requiredMargin
      });

      return trade.toJSON();
    } catch (error) {
      throw error;
    }
  }

  // Get trade by ID
  static async getTradeById(id) {
    try {
      const trade = await Trade.findByPk(id, {
        include: [
          { model: Account, as: 'account' },
          { model: User, as: 'user' },
          { model: Strategy, as: 'strategy' }
        ]
      });
      return trade ? trade.toJSON() : null;
    } catch (error) {
      throw error;
    }
  }

  // Get trades by user ID
  static async getTradesByUserId(userId, filters = {}) {
    try {
      const {
        status,
        symbol,
        startDate,
        endDate,
        page = 1,
        limit = 50,
        orderBy = 'openTime',
        order = 'DESC'
      } = filters;

      const where = { userId };
      const offset = (page - 1) * limit;

      if (status) where.status = status;
      if (symbol) where.symbol = symbol;
      if (startDate || endDate) {
        where.openTime = {};
        if (startDate) where.openTime[Op.gte] = new Date(startDate);
        if (endDate) where.openTime[Op.lte] = new Date(endDate);
      }

      const { count, rows } = await Trade.findAndCountAll({
        where,
        limit,
        offset,
        order: [[orderBy, order]],
        include: [
          { model: Account, as: 'account' },
          { model: Strategy, as: 'strategy' }
        ]
      });

      return {
        trades: rows.map(trade => trade.toJSON()),
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

  // Get trades by account ID
  static async getTradesByAccountId(accountId, filters = {}) {
    try {
      const {
        status,
        symbol,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = filters;

      const where = { accountId };
      const offset = (page - 1) * limit;

      if (status) where.status = status;
      if (symbol) where.symbol = symbol;
      if (startDate || endDate) {
        where.openTime = {};
        if (startDate) where.openTime[Op.gte] = new Date(startDate);
        if (endDate) where.openTime[Op.lte] = new Date(endDate);
      }

      const { count, rows } = await Trade.findAndCountAll({
        where,
        limit,
        offset,
        order: [['openTime', 'DESC']],
        include: [
          { model: Strategy, as: 'strategy' }
        ]
      });

      return {
        trades: rows.map(trade => trade.toJSON()),
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

  // Close trade
  static async closeTrade(tradeId, closePrice, closeTime = new Date()) {
    try {
      const trade = await Trade.findByPk(tradeId, {
        include: [{ model: Account, as: 'account' }]
      });

      if (!trade) {
        throw new Error('Trade not found');
      }

      if (trade.status !== 'OPEN') {
        throw new Error('Trade is not open');
      }

      // Close the trade
      trade.close(closePrice, closeTime);
      await trade.save();

      // Update account margin and balance
      const account = trade.account;
      const requiredMargin = account.calculateRequiredMargin(trade.lotSize, trade.symbol);
      
      await account.update({
        margin: parseFloat(account.margin) - requiredMargin,
        freeMargin: parseFloat(account.freeMargin) + requiredMargin,
        balance: parseFloat(account.balance) + parseFloat(trade.profit)
      });

      return trade.toJSON();
    } catch (error) {
      throw error;
    }
  }

  // Update trade current price
  static async updateTradePrice(tradeId, currentPrice) {
    try {
      const trade = await Trade.findByPk(tradeId);
      if (!trade) {
        throw new Error('Trade not found');
      }

      if (trade.status === 'OPEN') {
        trade.updateCurrentPrice(currentPrice);
        await trade.save();
      }

      return trade.toJSON();
    } catch (error) {
      throw error;
    }
  }

  // Get open positions
  static async getOpenPositions(userId) {
    try {
      const trades = await Trade.findAll({
        where: {
          userId,
          status: 'OPEN'
        },
        include: [
          { model: Account, as: 'account' },
          { model: Strategy, as: 'strategy' }
        ],
        order: [['openTime', 'DESC']]
      });

      return trades.map(trade => trade.toJSON());
    } catch (error) {
      throw error;
    }
  }

  // Get trading statistics
  static async getTradingStats(userId, period = '30d') {
    try {
      const startDate = new Date();
      switch (period) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      const trades = await Trade.findAll({
        where: {
          userId,
          status: 'CLOSED',
          closeTime: {
            [Op.gte]: startDate
          }
        }
      });

      const totalTrades = trades.length;
      const winningTrades = trades.filter(t => parseFloat(t.profit) > 0);
      const losingTrades = trades.filter(t => parseFloat(t.profit) < 0);

      const totalPnL = trades.reduce((sum, t) => sum + parseFloat(t.profit), 0);
      const totalWins = winningTrades.reduce((sum, t) => sum + parseFloat(t.profit), 0);
      const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + parseFloat(t.profit), 0));

      const stats = {
        period,
        totalTrades,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        totalPnL,
        winRate: totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0,
        averageWin: winningTrades.length > 0 ? totalWins / winningTrades.length : 0,
        averageLoss: losingTrades.length > 0 ? totalLosses / losingTrades.length : 0,
        profitFactor: totalLosses > 0 ? totalWins / totalLosses : 0,
        maxDrawdown: this.calculateMaxDrawdown(trades),
        sharpeRatio: this.calculateSharpeRatio(trades)
      };

      return stats;
    } catch (error) {
      throw error;
    }
  }

  // Calculate max drawdown
  static calculateMaxDrawdown(trades) {
    if (trades.length === 0) return 0;

    let peak = 0;
    let maxDrawdown = 0;
    let runningPnL = 0;

    trades.forEach(trade => {
      runningPnL += parseFloat(trade.profit);
      if (runningPnL > peak) {
        peak = runningPnL;
      }
      const drawdown = peak - runningPnL;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    return maxDrawdown;
  }

  // Calculate Sharpe ratio
  static calculateSharpeRatio(trades) {
    if (trades.length < 2) return 0;

    const returns = trades.map(trade => parseFloat(trade.profit));
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    return stdDev > 0 ? meanReturn / stdDev : 0;
  }

  // Get trades by strategy
  static async getTradesByStrategy(strategyId, filters = {}) {
    try {
      const {
        status,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = filters;

      const where = { strategyId };
      const offset = (page - 1) * limit;

      if (status) where.status = status;
      if (startDate || endDate) {
        where.openTime = {};
        if (startDate) where.openTime[Op.gte] = new Date(startDate);
        if (endDate) where.openTime[Op.lte] = new Date(endDate);
      }

      const { count, rows } = await Trade.findAndCountAll({
        where,
        limit,
        offset,
        order: [['openTime', 'DESC']],
        include: [
          { model: Account, as: 'account' },
          { model: User, as: 'user' }
        ]
      });

      return {
        trades: rows.map(trade => trade.toJSON()),
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

  // Delete trade (admin only)
  static async deleteTrade(tradeId) {
    try {
      const trade = await Trade.findByPk(tradeId);
      if (!trade) {
        throw new Error('Trade not found');
      }

      await trade.destroy();
      return { message: 'Trade deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TradeService;
