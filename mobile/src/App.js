import React, { useEffect, useState } from 'react';
import { View, StatusBar, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import NetInfo from 'react-native-netinfo';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

// Screens
import DashboardScreen from './screens/DashboardScreen';
import TradingScreen from './screens/TradingScreen';
import PortfolioScreen from './screens/PortfolioScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import OfflineScreen from './screens/OfflineScreen';

// Components
import CustomTabBar from './components/CustomTabBar';
import LoadingScreen from './components/LoadingScreen';
import OfflineBanner from './components/OfflineBanner';

// Services
import { initializeOfflineTrading } from './services/OfflineTradingService';
import { initializePushNotifications } from './services/PushNotificationService';
import { initializeBiometrics } from './services/BiometricService';
import { checkAppUpdate } from './services/UpdateService';

// Store
import { useDispatch, useSelector } from 'react-redux';
import { setOfflineMode, setUser } from './store/slices/appSlice';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: 'home',
          tabBarLabel: 'Dashboard'
        }}
      />
      <Tab.Screen 
        name="Trading" 
        component={TradingScreen}
        options={{
          tabBarIcon: 'trending-up',
          tabBarLabel: 'Trading'
        }}
      />
      <Tab.Screen 
        name="Portfolio" 
        component={PortfolioScreen}
        options={{
          tabBarIcon: 'pie-chart',
          tabBarLabel: 'Portfolio'
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{
          tabBarIcon: 'bar-chart',
          tabBarLabel: 'Analytics'
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarIcon: 'settings',
          tabBarLabel: 'Settings'
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(state => state.app.user);
  const offlineMode = useSelector(state => state.app.offlineMode);

  useEffect(() => {
    initializeApp();
    setupNetworkListener();
    setupPushNotifications();
  }, []);

  const initializeApp = async () => {
    try {
      // Check for stored user session
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        dispatch(setUser(JSON.parse(storedUser)));
      }

      // Initialize offline trading capabilities
      await initializeOfflineTrading();

      // Initialize biometric authentication
      await initializeBiometrics();

      // Check for app updates
      await checkAppUpdate();

      // Check network status
      const netInfo = await NetInfo.fetch();
      setIsOffline(!netInfo.isConnected);
      dispatch(setOfflineMode(!netInfo.isConnected));

      setIsLoading(false);
    } catch (error) {
      console.error('App initialization error:', error);
      setIsLoading(false);
    }
  };

  const setupNetworkListener = () => {
    NetInfo.addEventListener(state => {
      const wasOffline = isOffline;
      const isNowOffline = !state.isConnected;
      
      setIsOffline(isNowOffline);
      dispatch(setOfflineMode(isNowOffline));

      if (wasOffline && !isNowOffline) {
        // Came back online
        Alert.alert(
          'Connection Restored',
          'You are back online. Syncing your offline trades...',
          [{ text: 'OK' }]
        );
      } else if (!wasOffline && isNowOffline) {
        // Went offline
        Alert.alert(
          'Offline Mode',
          'You are now in offline mode. Some features may be limited.',
          [{ text: 'OK' }]
        );
      }
    });
  };

  const setupPushNotifications = () => {
    initializePushNotifications();
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#1a1a1a" 
        translucent={true}
      />
      
      {isOffline && <OfflineBanner />}
      
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Offline" component={OfflineScreen} />
      </Stack.Navigator>
    </View>
  );
};

export default App;


