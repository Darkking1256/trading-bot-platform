// client/src/lib/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  path: "/socket.io",
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  withCredentials: false,
});

// Connection status management
export const socketStatus = {
  connected: false,
  connecting: false,
  error: null
};

socket.on("connect", () => {
  console.log("✅ Socket connected to trading server");
  socketStatus.connected = true;
  socketStatus.connecting = false;
  socketStatus.error = null;
});

socket.on("disconnect", () => {
  console.log("❌ Socket disconnected from trading server");
  socketStatus.connected = false;
  socketStatus.connecting = false;
});

socket.on("connect_error", (error) => {
  console.log("❌ Socket connection error:", error);
  socketStatus.connected = false;
  socketStatus.connecting = false;
  socketStatus.error = error.message;
});

// Trading event handlers
export const tradingEvents = {
  onTick: (callback) => socket.on("tick", callback),
  onPerformanceUpdate: (callback) => socket.on("performanceUpdate", callback),
  onTradeExecuted: (callback) => socket.on("tradeExecuted", callback),
  onTradingStatus: (callback) => socket.on("tradingStatus", callback),
  onLog: (callback) => socket.on("log", callback),
  onError: (callback) => socket.on("tradingError", callback),
  
  // Cleanup
  offTick: () => socket.off("tick"),
  offPerformanceUpdate: () => socket.off("performanceUpdate"),
  offTradeExecuted: () => socket.off("tradeExecuted"),
  offTradingStatus: () => socket.off("tradingStatus"),
  offLog: () => socket.off("log"),
  offError: () => socket.off("tradingError"),
  
  // Trading actions
  startDemo: () => socket.emit("startDemo"),
  startLive: (config) => socket.emit("startLive", config),
  startTrading: (strategy, parameters) => socket.emit("startTrading", { strategy, parameters }),
  stopTrading: () => socket.emit("stopTrading"),
  stopAll: () => socket.emit("stopAll"),
  backtest: (config) => socket.emit("backtest", config),
  getTradingStatus: () => socket.emit("getTradingStatus")
};
