import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeBiometrics } from '../../services/BiometricService';

// Async thunks
export const loginUser = createAsyncThunk(
  'app/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      // Simulate API call
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: '1',
            email: credentials.email,
            name: 'Demo User',
            avatar: null,
            subscription: 'premium',
            settings: {
              biometrics: true,
              notifications: true,
              theme: 'dark',
              language: 'en',
            },
          });
        }, 1000);
      });

      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(response));
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'app/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await AsyncStorage.removeItem('user');
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserSettings = createAsyncThunk(
  'app/updateUserSettings',
  async (settings, { getState, rejectWithValue }) => {
    try {
      const currentUser = getState().app.user;
      const updatedUser = { ...currentUser, settings: { ...currentUser.settings, ...settings } };
      
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  offlineMode: false,
  biometricsEnabled: false,
  notificationsEnabled: true,
  theme: 'dark',
  language: 'en',
  appVersion: '1.0.0',
  lastSync: null,
  networkStatus: 'connected',
  deviceInfo: null,
};

// Slice
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOfflineMode: (state, action) => {
      state.offlineMode = action.payload;
      state.networkStatus = action.payload ? 'offline' : 'connected';
    },
    setNetworkStatus: (state, action) => {
      state.networkStatus = action.payload;
    },
    setBiometricsEnabled: (state, action) => {
      state.biometricsEnabled = action.payload;
    },
    setNotificationsEnabled: (state, action) => {
      state.notificationsEnabled = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setLastSync: (state, action) => {
      state.lastSync = action.payload;
    },
    setDeviceInfo: (state, action) => {
      state.deviceInfo = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.biometricsEnabled = false;
      })
      // Update settings
      .addCase(updateUserSettings.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

// Actions
export const {
  setOfflineMode,
  setNetworkStatus,
  setBiometricsEnabled,
  setNotificationsEnabled,
  setTheme,
  setLanguage,
  setLastSync,
  setDeviceInfo,
  clearError,
  setLoading,
} = appSlice.actions;

// Selectors
export const selectUser = (state) => state.app.user;
export const selectIsAuthenticated = (state) => state.app.isAuthenticated;
export const selectIsLoading = (state) => state.app.isLoading;
export const selectError = (state) => state.app.error;
export const selectOfflineMode = (state) => state.app.offlineMode;
export const selectNetworkStatus = (state) => state.app.networkStatus;
export const selectTheme = (state) => state.app.theme;
export const selectLanguage = (state) => state.app.language;
export const selectUserSettings = (state) => state.app.user?.settings;
export const selectSubscription = (state) => state.app.user?.subscription;

export default appSlice.reducer;



