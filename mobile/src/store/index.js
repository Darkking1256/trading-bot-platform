import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from 'redux-logger';

// Slices
import appSlice from './slices/appSlice';
import tradingSlice from './slices/tradingSlice';
import portfolioSlice from './slices/portfolioSlice';
import analyticsSlice from './slices/analyticsSlice';
import offlineSlice from './slices/offlineSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['app', 'offline'], // Only persist these slices
  blacklist: ['trading', 'portfolio', 'analytics'], // Don't persist these
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, appSlice);

// Logger middleware (only in development)
const logger = createLogger({
  predicate: () => __DEV__,
  collapsed: true,
});

// Store configuration
export const store = configureStore({
  reducer: {
    app: persistedReducer,
    trading: tradingSlice,
    portfolio: portfolioSlice,
    analytics: analyticsSlice,
    offline: offlineSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(logger),
  devTools: __DEV__,
});

// Persistor for rehydration
export const persistor = persistStore(store);

// Root state and dispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


