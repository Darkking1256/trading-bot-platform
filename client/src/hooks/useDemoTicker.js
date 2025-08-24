// client/src/hooks/useDemoTicker.js
import { useEffect, useRef } from "react";

export function useDemoTicker(enabled, onTick, onPerf) {
  const state = useRef({
    prices: { 
      EURUSD: 1.0850, 
      GBPUSD: 1.2650, 
      USDJPY: 148.5, 
      AUDUSD: 0.6580, 
      USDCAD: 1.3520,
      EURGBP: 0.8570,
      USDCHF: 0.8920,
      NZDUSD: 0.6120,
      EURJPY: 161.2,
      GBPJPY: 187.8,
      AUDJPY: 97.7,
      CADJPY: 109.8
    },
    pnl: 0, 
    trades: 0, 
    wins: 0,
    balance: 10000,
    positions: [],
    tradeHistory: []
  });

  useEffect(() => {
    if (!enabled) return;
    
    const id = setInterval(() => {
      // Generate price ticks
      Object.keys(state.current.prices).forEach((symbol) => {
        const currentPrice = state.current.prices[symbol];
        const volatility = symbol.includes('JPY') ? 0.0008 : 0.0015;
        const step = (Math.random() - 0.5) * volatility;
        const newPrice = currentPrice * (1 + step);
        state.current.prices[symbol] = +newPrice.toFixed(5);
        
        onTick?.({ 
          symbol, 
          price: state.current.prices[symbol], 
          ts: Date.now(),
          change: +((newPrice - currentPrice) / currentPrice * 100).toFixed(4)
        });
      });

      // Generate fake trades occasionally
      if (Math.random() < 0.35) {
        const symbols = Object.keys(state.current.prices);
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        const win = Math.random() < 0.55;
        const pnl = +(win ? (7.5 + Math.random() * 5) : -(5.0 + Math.random() * 3)).toFixed(2);
        
        state.current.trades += 1;
        if (win) state.current.wins += 1;
        state.current.pnl = +(state.current.pnl + pnl).toFixed(2);
        state.current.balance = +(10000 + state.current.pnl).toFixed(2);
        
        const winRate = state.current.trades ? Math.round((state.current.wins / state.current.trades) * 100) : 0;
        
        // Add to trade history
        const trade = {
          id: `trade_${Date.now()}`,
          symbol: randomSymbol,
          action: win ? 'BUY' : 'SELL',
          price: state.current.prices[randomSymbol],
          volume: 0.1,
          pnl: pnl,
          timestamp: new Date().toISOString(),
          reason: win ? 'Demo Win' : 'Demo Loss'
        };
        
        state.current.tradeHistory.push(trade);
        if (state.current.tradeHistory.length > 50) {
          state.current.tradeHistory.shift();
        }

        onPerf?.({ 
          pnl: state.current.pnl, 
          trades: state.current.trades, 
          winRate, 
          balance: state.current.balance,
          tradeHistory: state.current.tradeHistory
        });
      }
    }, 1000);
    
    return () => clearInterval(id);
  }, [enabled, onTick, onPerf]);

  return state.current;
}
