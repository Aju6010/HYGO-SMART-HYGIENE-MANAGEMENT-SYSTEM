import React, { useState, useEffect } from 'react';
import "../styles/DashboardCards.css";

const DashboardCards = () => {

  const [cardData, setCardData] = useState([
    { title: 'Total Toilets', count: 0, sub: 'All facilities', icon: '🚽', color: 'blue' },
    { title: 'Clean Toilets', count: 0, sub: '+5% today', icon: '✨', color: 'green' },
    { title: 'Dirty Toilets', count: 0, sub: 'Needs attention', icon: '💧', color: 'red' },
    { title: 'Active Alerts', count: 0, sub: 'Requires action', icon: '⚠️', color: 'orange' }
  ]);

  useEffect(() => {

    const fetchDashboardData = async () => {

      try {

        const toiletsRes = await fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/toilets");
        const alertsRes = await fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/alerts");

        if (!toiletsRes.ok || !alertsRes.ok) {
          throw new Error("API error");
        }

        const toilets = await toiletsRes.json();
        const alerts = await alertsRes.json();

        const total = Array.isArray(toilets) ? toilets.length : 0;
        const alertCount = Array.isArray(alerts) ? alerts.length : 0;

        const dirty = alertCount;
        const clean = Math.max(total - dirty, 0);

        setCardData([
          { title: 'Total Toilets', count: total, sub: 'All facilities', icon: '🚽', color: 'blue' },
          { title: 'Clean Toilets', count: clean, sub: '+5% today', icon: '✨', color: 'green' },
          { title: 'Dirty Toilets', count: dirty, sub: 'Needs attention', icon: '💧', color: 'red' },
          { title: 'Active Alerts', count: alertCount, sub: 'Requires action', icon: '⚠️', color: 'orange' }
        ]);

      } catch (error) {

        console.log("Dashboard API error:", error);

      }

    };

    fetchDashboardData();

  }, []);

  return (
    <div className="metrics-grid">

      {cardData.map((card, index) => (

        <div key={index} className={`metric-card ${card.color}-theme`}>

          <div className="card-info">
            <span className="card-title">{card.title}</span>
            <h2 className="card-count">{card.count}</h2>
            <span className={`card-sub ${card.color}-text`}>
              {card.sub}
            </span>
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