import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from 'react-native-netinfo';
import BackgroundJob from 'react-native-background-job';
import { store } from '../store';
import { setOfflineMode } from '../store/slices/appSlice';

class OfflineTradingService {
  constructor() {
    this.offlineTrades = [];
    this.pendingSync = [];
    this.isInitialized = false;
    this.syncInterval = null;
    this.backgroundJob = null;
  }

  async initialize() {
    try {
      // Load offline trades from storage
      await this.loadOfflineTrades();
      
      // Load pending sync queue
      await this.loadPendingSync();
      
      // Setup background sync job
      await this.setupBackgroundSync();
      
      // Setup network listener
      this.setupNetworkListener();
      
      this.isInitialized = true;
      console.log('Offline Trading Service initialized');
    } catch (error) {
      console.error('Failed to initialize Offline Trading Service:', error);
    }
  }

  async loadOfflineTrades() {
    try {
      const stored = await AsyncStorage.getItem('offlineTrades');
      this.offlineTrades = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load offline trades:', error);
      this.offlineTrades = [];
    }
  }

  async loadPendingSync() {
    try {
      const stored = await AsyncStorage.getItem('pendingSync');
      this.pendingSync = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load pending sync:', error);
      this.pendingSync = [];
    }
  }

  async saveOfflineTrades() {
    try {
      await AsyncStorage.setItem('offlineTrades', JSON.stringify(this.offlineTrades));
    } catch (error) {
      console.error('Failed to save offline trades:', error);
    }
  }

  async savePendingSync() {
    try {
      await AsyncStorage.setItem('pendingSync', JSON.stringify(this.pendingSync));
    } catch (error) {
      console.error('Failed to save pending sync:', error);
    }
  }

  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      if (state.isConnected && this.pendingSync.length > 0) {
        this.syncOfflineTrades();
      }
    });
  }

  async setupBackgroundSync() {
    try {
      // Configure background job for syncing
      BackgroundJob.register({
        jobKey: 'offlineTradingSync',
        job: async () => {
          await this.syncOfflineTrades();
        },
      });

      // Schedule background job to run every 15 minutes
      await BackgroundJob.schedule({
        jobKey: 'offlineTradingSync',
        period: 15 * 60 * 1000, // 15 minutes
        networkType: BackgroundJob.NETWORK_TYPE_ANY,
        requiresCharging: false,
        requiresDeviceIdle: false,
        exact: false,
        persist: true,
      });

      console.log('Background sync job scheduled');
    } catch (error) {
      console.error('Failed to setup background sync:', error);
    }
  }

  async placeOfflineTrade(tradeData) {
    try {
      const offlineTrade = {
        id: this.generateTradeId(),
        ...tradeData,
        timestamp: new Date().toISOString(),
        status: 'pending',
        isOffline: true,
      };

      // Add to offline trades
      this.offlineTrades.push(offlineTrade);
      await this.saveOfflineTrades();

      // Add to pending sync
      this.pendingSync.push({
        type: 'placeTrade',
        data: offlineTrade,
        timestamp: new Date().toISOString(),
      });
      await this.savePendingSync();

      // Simulate trade execution
      await this.simulateTradeExecution(offlineTrade);

      return offlineTrade;
    } catch (error) {
      console.error('Failed to place offline trade:', error);
      throw error;
    }
  }

  async simulateTradeExecution(trade) {
    // Simulate trade execution with realistic delays
    setTimeout(() => {
      trade.status = 'executed';
      trade.executionPrice = this.calculateExecutionPrice(trade);
      trade.executionTime = new Date().toISOString();
      this.saveOfflineTrades();
    }, 1000 + Math.random() * 2000); // 1-3 second delay
  }

  calculateExecutionPrice(trade) {
    // Simulate realistic price movement
    const basePrice = parseFloat(trade.price);
    const spread = 0.0001; // 1 pip spread
    const slippage = (Math.random() - 0.5) * 0.0002; // Random slippage
    
    if (trade.type === 'buy') {
      return basePrice + spread + slippage;
    } else {
      return basePrice - spread + slippage;
    }
  }

  async syncOfflineTrades() {
    if (this.pendingSync.length === 0) return;

    try {
      console.log(`Syncing ${this.pendingSync.length} offline trades...`);

      for (const syncItem of this.pendingSync) {
        try {
          await this.processSyncItem(syncItem);
        } catch (error) {
          console.error('Failed to process sync item:', error);
        }
      }

      // Clear pending sync after successful sync
      this.pendingSync = [];
      await this.savePendingSync();

      // Update last sync timestamp
      store.dispatch(setOfflineMode(false));
      
      console.log('Offline trades synced successfully');
    } catch (error) {
      console.error('Failed to sync offline trades:', error);
    }
  }

  async processSyncItem(syncItem) {
    // Simulate API call to sync with server
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real implementation, this would make actual API calls
    console.log('Synced:', syncItem.type, syncItem.data.id);
  }

  async getOfflineTrades() {
    return this.offlineTrades;
  }

  async getPendingSync() {
    return this.pendingSync;
  }

  async clearOfflineTrades() {
    this.offlineTrades = [];
    await this.saveOfflineTrades();
  }

  async clearPendingSync() {
    this.pendingSync = [];
    await this.savePendingSync();
  }

  generateTradeId() {
    return 'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  isOfflineCapable() {
    return this.isInitialized;
  }

  async getOfflineStatus() {
    const netInfo = await NetInfo.fetch();
    return {
      isOffline: !netInfo.isConnected,
      offlineTradesCount: this.offlineTrades.length,
      pendingSyncCount: this.pendingSync.length,
      lastSync: await AsyncStorage.getItem('lastSync'),
    };
  }
}

// Create singleton instance
const offlineTradingService = new OfflineTradingService();

// Export functions
export const initializeOfflineTrading = () => offlineTradingService.initialize();
export const placeOfflineTrade = (tradeData) => offlineTradingService.placeOfflineTrade(tradeData);
export const syncOfflineTrades = () => offlineTradingService.syncOfflineTrades();
export const getOfflineTrades = () => offlineTradingService.getOfflineTrades();
export const getPendingSync = () => offlineTradingService.getPendingSync();
export const getOfflineStatus = () => offlineTradingService.getOfflineStatus();
export const isOfflineCapable = () => offlineTradingService.isOfflineCapable();

export default offlineTradingService;






