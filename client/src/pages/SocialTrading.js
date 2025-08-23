import React from 'react';
import SocialTrading from '../components/SocialTrading';

const SocialTradingPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Social Trading</h1>
        <p className="text-gray-400">Follow top traders and copy their strategies</p>
      </div>
      
      <SocialTrading />
    </div>
  );
};

export default SocialTradingPage;
