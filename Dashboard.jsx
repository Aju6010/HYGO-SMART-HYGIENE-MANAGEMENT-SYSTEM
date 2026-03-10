import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import Sidebar from "../component/Sidebar";
import "../styles/dash.css";
import { useEffect, useState } from "react";

function Dashboard() {
  const [alerts, setAlerts] = useState([]);

  // 🔗 Fetch alerts from Flask (DB)
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/cleaning-alerts")
      .then(res => res.json())
      .then(data => setAlerts(data));
  }, []);

  // ===== YOUR ORIGINAL CHART DATA (UNCHANGED) =====
  const data = {
    labels: ["T01", "T02", "T03", "T04", "T05"],
    datasets: [
      {
        label: "Usage Count",
        data: [120, 90, 150, 70, 110],
        backgroundColor: "#3DDC84",
      },
      {
        label: "Cleanliness Score",
        data: [85, 92, 78, 88, 90],
        backgroundColor: "#0F2027",
      },
    ],
  };

  const pieData = {
    labels: ["Clean", "Moderate", "Dirty"],
    datasets: [
      {
        data: [70, 20, 10],
        backgroundColor: ["#38bdf8", "#facc15", "#f87171"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        {/* HEADER */}
        <div className="dash-header">
          <div className="dash-title">
            <h1>Dashboard</h1>
            <p>Monitor and manage hygiene across all facilities</p>
          </div>

          <button className="refresh-btn">⟳ Refresh Data</button>
        </div>

        {/* KPI CARDS — ORIGINAL DESIGN RESTORED */}
        <div className="cards">

          <div className="card card-blue">
            <div className="card-content">
              <p className="card-title">Total Toilets</p>
              <h2>5</h2>
              <span className="card-sub">All facilities</span>
            </div>
            <div className="card-icon blue">🚿</div>
          </div>

          <div className="card card-green">
            <div className="card-content">
              <p className="card-title">Clean Toilets</p>
              <h2>3</h2>
              <span className="card-sub up">+5% today</span>
            </div>
            <div className="card-icon green">✨</div>
          </div>

          <div className="card card-red">
            <div className="card-content">
              <p className="card-title">Dirty Toilets</p>
              <h2>1</h2>
              <span className="card-sub danger">Needs attention</span>
            </div>
            <div className="card-icon red">💧</div>
          </div>

          <div className="card card-yellow">
            <div className="card-content">
              <p className="card-title">Active Alerts</p>
              {/* 🔥 LIVE ALERT COUNT FROM DB */}
              <h2>{alerts.length}</h2>
              <span className="card-sub">Requires action</span>
            </div>
            <div className="card-icon yellow">⚠️</div>
          </div>

        </div>

        {/* CHART SECTION */}
        <div className="section">
          <h3>Usage & Cleanliness Analytics</h3>

          <div className="charts-row">
            <div className="chart bar-chart">
              <Bar data={data} />
            </div>

            <div className="chart pie-chart">
              <Pie data={pieData} />
            </div>
          </div>
        </div>

        {/* ALERTS SECTION — FROM DATABASE */}
        <div className="alerts-section">
          <h3>Active Alerts</h3>

          {alerts.length === 0 && (
            <p style={{ color: "green" }}>
              No alerts. All toilets are clean ✅
            </p>
          )}

          <div className="alerts-list">
            {alerts.map((alert, index) => (
              <div key={index} className="alert-card critical">
                <div className="alert-left">
                  <strong>Toilet {alert.toilet_id}</strong>
                  <p>{alert.message}</p>
                </div>

                <div className="alert-right">
                  <span>{alert.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;