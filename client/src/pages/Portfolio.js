import React from 'react';
import PortfolioManagement from '../components/PortfolioManagement';

const Portfolio = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Portfolio Management</h1>
        <p className="text-gray-400">Manage your trading accounts and analyze performance</p>
      </div>
      
      <PortfolioManagement />
    </div>
  );
};

export default Portfolio;
