import React from 'react';
import "../styles/DashboardCards.css";

const DashboardCards = () => {
  const cardData = [
    { title: 'Total Toilets', count: 8, sub: 'All facilities', icon: '🚽', color: 'blue' },
    { title: 'Clean Toilets', count: 5, sub: '+5% today', icon: '✨', color: 'green' },
    { title: 'Dirty Toilets', count: 2, sub: 'Needs attention', icon: '💧', color: 'red' },
    { title: 'Active Alerts', count: 3, sub: 'Requires action', icon: '⚠️', color: 'orange' }
  ];

  return (
    <div className="metrics-grid">
      {cardData.map((card, index) => (
        <div key={index} className={`metric-card ${card.color}-theme`}>
          <div className="card-info">
            <span className="card-title">{card.title}</span>
            <h2 className="card-count">{card.count}</h2>
            <span className={`card-sub ${card.color}-text`}>{card.sub}</span>
          </div>
          <div className={`card-icon-box ${card.color}-bg`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;