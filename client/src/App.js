import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TradingView from './pages/TradingView';
import Portfolio from './pages/Portfolio';
import SocialTrading from './pages/SocialTrading';
import RiskManagement from './pages/RiskManagement';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import AlgorithmicTrading from './pages/AlgorithmicTrading';
import Positions from './pages/Positions';
import History from './pages/History';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-300">Loading Trading Platform...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e1e2e',
              color: '#ffffff',
              border: '1px solid #313244',
            },
          }}
        />
      </>
    );
  }

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                  <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/trading" element={<TradingView />} />
                        <Route path="/portfolio" element={<Portfolio />} />
                        <Route path="/social-trading" element={<SocialTrading />} />
                        <Route path="/risk-management" element={<RiskManagement />} />
                        <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
                        <Route path="/algorithmic-trading" element={<AlgorithmicTrading />} />
                        <Route path="/positions" element={<Positions />} />
                        <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e1e2e',
            color: '#ffffff',
            border: '1px solid #313244',
          },
        }}
      />
    </>
  );
}

export default App;



