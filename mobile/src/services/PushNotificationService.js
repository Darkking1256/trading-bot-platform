import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { selectNotificationsEnabled } from '../store/slices/appSlice';

class PushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.notificationChannels = {};
    this.scheduledNotifications = [];
    this.notificationHistory = [];
  }

  async initialize() {
    try {
      // Configure push notifications
      this.configurePushNotifications();
      
      // Create notification channels
      this.createNotificationChannels();
      
      // Load notification settings
      await this.loadNotificationSettings();
      
      // Setup notification listeners
      this.setupNotificationListeners();
      
      this.isInitialized = true;
      console.log('Push Notification Service initialized');
    } catch (error) {
      console.error('Failed to initialize Push Notification Service:', error);
    }
  }

  configurePushNotifications() {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log('TOKEN:', token);
        // Send token to server for push notifications
      },

      // (required) Called when a remote or local notification is opened or received
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        
        // Process notification based on type
        this.processNotification(notification);
        
        // Required on iOS only (see fetchCompletionHandler docs: https://github.com/react-native-community/react-native-push-notification-ios)
        notification.finish(PushNotification.FetchResult.NoData);
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function(err) {
        console.error(err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - false: it will not be called (only if `popInitialNotification` is true)
       * - true: it will be called every time a notification is opened or received
       */
      requestPermissions: true,
    });
  }

  createNotificationChannels() {
    // Create different notification channels for different types of notifications
    const channels = [
      {
        channelId: 'trading-alerts',
        channelName: 'Trading Alerts',
        channelDescription: 'Real-time trading alerts and signals',
        soundName: 'default',
        importance: 4, // High importance
        vibrate: true,
      },
      {
        channelId: 'price-alerts',
        channelName: 'Price Alerts',
        channelDescription: 'Price movement and level alerts',
        soundName: 'default',
        importance: 3, // Default importance
        vibrate: true,
      },
      {
        channelId: 'risk-alerts',
        channelName: 'Risk Alerts',
        channelDescription: 'Risk management and safety alerts',
        soundName: 'default',
        importance: 5, // Urgent importance
        vibrate: true,
      },
      {
        channelId: 'news-updates',
        channelName: 'News Updates',
        channelDescription: 'Market news and economic updates',
        soundName: 'default',
        importance: 2, // Low importance
        vibrate: false,
      },
      {
        channelId: 'system-updates',
        channelName: 'System Updates',
        channelDescription: 'App updates and maintenance notifications',
        soundName: 'default',
        importance: 1, // Min importance
        vibrate: false,
      },
    ];

    channels.forEach(channel => {
      PushNotification.createChannel(channel);
      this.notificationChannels[channel.channelId] = channel;
    });
  }

  async loadNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        this.notificationSettings = JSON.parse(settings);
      } else {
        // Default settings
        this.notificationSettings = {
          tradingAlerts: true,
          priceAlerts: true,
          riskAlerts: true,
          newsUpdates: false,
          systemUpdates: true,
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00',
          },
          sound: true,
          vibration: true,
          badge: true,
        };
        await this.saveNotificationSettings();
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }

  async saveNotificationSettings() {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  setupNotificationListeners() {
    // Listen for notification actions
    PushNotification.onAction = (notification) => {
      console.log('ACTION:', notification.action);
      console.log('NOTIFICATION:', notification);
      
      // Handle notification actions
      this.handleNotificationAction(notification);
    };

    // Listen for notification received
    PushNotification.onNotification = (notification) => {
      console.log('NOTIFICATION RECEIVED:', notification);
      
      // Add to notification history
      this.addToNotificationHistory(notification);
      
      // Process notification
      this.processNotification(notification);
    };

    // Listen for notification opened
    PushNotification.onNotificationOpened = (notification) => {
      console.log('NOTIFICATION OPENED:', notification);
      
      // Handle notification open
      this.handleNotificationOpen(notification);
    };
  }

  async sendNotification(type, title, message, data = {}) {
    const notificationsEnabled = selectNotificationsEnabled(store.getState());
    if (!notificationsEnabled) return;

    // Check quiet hours
    if (this.isInQuietHours()) {
      console.log('Notification blocked during quiet hours');
      return;
    }

    const channelId = this.getChannelIdForType(type);
    const settings = this.notificationSettings[type] || true;

    if (!settings) return;

    const notification = {
      channelId,
      title,
      message,
      data,
      smallIcon: 'ic_notification',
      largeIcon: 'ic_launcher',
      bigText: message,
      subText: type,
      vibrate: this.notificationSettings.vibration,
      vibration: 300,
      priority: 'high',
      importance: 'high',
      allowWhileIdle: true,
      ignoreInForeground: false,
    };

    try {
      PushNotification.localNotification(notification);
      console.log('Notification sent:', title);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  async scheduleNotification(type, title, message, date, data = {}) {
    const channelId = this.getChannelIdForType(type);
    
    const notification = {
      channelId,
      title,
      message,
      date,
      data,
      smallIcon: 'ic_notification',
      largeIcon: 'ic_launcher',
      bigText: message,
      subText: type,
      vibrate: this.notificationSettings.vibration,
      vibration: 300,
      priority: 'high',
      importance: 'high',
      allowWhileIdle: true,
      ignoreInForeground: false,
    };

    try {
      const scheduledId = PushNotification.localNotificationSchedule(notification);
      this.scheduledNotifications.push({
        id: scheduledId,
        type,
        title,
        message,
        date,
        data,
      });
      console.log('Notification scheduled:', title, 'for', date);
      return scheduledId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  getChannelIdForType(type) {
    const channelMap = {
      trading: 'trading-alerts',
      price: 'price-alerts',
      risk: 'risk-alerts',
      news: 'news-updates',
      system: 'system-updates',
    };
    return channelMap[type] || 'trading-alerts';
  }

  isInQuietHours() {
    if (!this.notificationSettings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = this.notificationSettings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = this.notificationSettings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight quiet hours
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  processNotification(notification) {
    // Process notification based on type
    const type = notification.data?.type || 'general';
    
    switch (type) {
      case 'trade_executed':
        this.handleTradeExecuted(notification);
        break;
      case 'price_alert':
        this.handlePriceAlert(notification);
        break;
      case 'risk_alert':
        this.handleRiskAlert(notification);
        break;
      case 'news_update':
        this.handleNewsUpdate(notification);
        break;
      default:
        console.log('Unknown notification type:', type);
    }
  }

  handleNotificationAction(notification) {
    // Handle notification actions (e.g., "View Trade", "Dismiss", etc.)
    const action = notification.action;
    const data = notification.data;

    switch (action) {
      case 'VIEW_TRADE':
        // Navigate to trade details
        break;
      case 'CLOSE_POSITION':
        // Close position
        break;
      case 'DISMISS':
        // Dismiss notification
        break;
      default:
        console.log('Unknown notification action:', action);
    }
  }

  handleNotificationOpen(notification) {
    // Handle when user opens notification
    const data = notification.data;
    
    // Navigate to appropriate screen based on notification type
    if (data?.screen) {
      // Navigate to screen
      console.log('Navigate to:', data.screen);
    }
  }

  addToNotificationHistory(notification) {
    this.notificationHistory.unshift({
      id: Date.now().toString(),
      ...notification,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 100 notifications
    if (this.notificationHistory.length > 100) {
      this.notificationHistory = this.notificationHistory.slice(0, 100);
    }
  }

  // Specific notification handlers
  handleTradeExecuted(notification) {
    console.log('Trade executed notification:', notification);
  }

  handlePriceAlert(notification) {
    console.log('Price alert notification:', notification);
  }

  handleRiskAlert(notification) {
    console.log('Risk alert notification:', notification);
  }

  handleNewsUpdate(notification) {
    console.log('News update notification:', notification);
  }

  // Utility methods
  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
    this.scheduledNotifications = [];
  }

  cancelNotification(notificationId) {
    PushNotification.cancelLocalNotifications({ id: notificationId });
    this.scheduledNotifications = this.scheduledNotifications.filter(
      n => n.id !== notificationId
    );
  }

  getScheduledNotifications() {
    return this.scheduledNotifications;
  }

  getNotificationHistory() {
    return this.notificationHistory;
  }

  async updateNotificationSettings(settings) {
    this.notificationSettings = { ...this.notificationSettings, ...settings };
    await this.saveNotificationSettings();
  }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

// Export functions
export const initializePushNotifications = () => pushNotificationService.initialize();
export const sendNotification = (type, title, message, data) => pushNotificationService.sendNotification(type, title, message, data);
export const scheduleNotification = (type, title, message, date, data) => pushNotificationService.scheduleNotification(type, title, message, date, data);
export const cancelAllNotifications = () => pushNotificationService.cancelAllNotifications();
export const cancelNotification = (notificationId) => pushNotificationService.cancelNotification(notificationId);
export const getScheduledNotifications = () => pushNotificationService.getScheduledNotifications();
export const getNotificationHistory = () => pushNotificationService.getNotificationHistory();
export const updateNotificationSettings = (settings) => pushNotificationService.updateNotificationSettings(settings);

export default pushNotificationService;




