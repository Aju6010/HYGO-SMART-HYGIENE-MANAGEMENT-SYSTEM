import { Bar, Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import Sidebar from "../component/Sidebar";
import "../styles/dash.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Dashboard() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [toilets, setToilets] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [toiletData, setToiletData] = useState([]);


  const fetchData = () => {
    console.log("REFRESH CLICKED");
    // Alerts
    fetch(`${API_BASE_URL}/api/alerts`)
      .then(res => res.json())
      .then(data => setAlerts(data));

    // Toilets
    fetch(`${API_BASE_URL}/api/toilets`)
      .then(res => res.json())
      .then(data => setToilets(data));

    //  (AI prediction)
    fetch(`${API_BASE_URL}/api/predict-from-db`)
      .then(res => res.json())
      .then(data => setPredictions(data))
      .catch(err => console.log("Prediction error:", err));
  };

  // 🔗 Fetch alerts from Flask (DB)
  useEffect(() => {
    fetchData();
  }, [])

  // ===== KPI CALCULATIONS (Synchronized with Toilet Status page) =====
  const total = toilets.length;
  // Dirty = Toilets marked as 'dirty'
  const dirty = toilets.filter(t => t.status === "dirty").length;
  // Needs Attention = Toilets marked as 'needs cleaning' or 'maintenance'
  const needsAttention = toilets.filter(t => t.status === "needs cleaning" || t.status === "maintenance").length;
  // Clean = Toilets marked as 'clean'
  const clean = toilets.filter(t => t.status === "clean").length;
  const resolved = 0; // Coming from cleaning_log soon


  // ===== DYNAMIC DATA =====

  // Labels
  const labels = predictions.map(t => `T${t.toilet_id}`);

  // Data
  const usageData = predictions.map(t => t.usage_count || 0);
  const cleanlinessData = predictions.map(t => t.cleanliness_score || 0);

  // ✅ MODERN COLOR PALETTE
  const data = {
    labels,
    datasets: [
      {
        label: "Usage Count",
        data: usageData,
        backgroundColor: "#10b981", // Emerald
        borderRadius: 8,
        barThickness: 30,
      },
      {
        label: "Cleanliness Score",
        data: cleanlinessData,
        backgroundColor: "#1e293b", // Slate
        borderRadius: 8,
        barThickness: 30,
      },
    ],
  };

  // ===== DOUGHNUT CHART (Renamed from Pie) =====
  const cleanCount = predictions.filter(t => t.status.toLowerCase() === "clean").length;
  const moderateCount = predictions.filter(t => t.status.toLowerCase() === "moderate").length;
  const dirtyCount = predictions.filter(t => t.status.toLowerCase() === "dirty" || t.status.toLowerCase() === "dirty soon").length;
  const pendingCount = predictions.filter(t => t.status.toLowerCase() === "data pending").length;

  const donutData = {
    labels: ["Clean", "Moderate", "Dirty", "Pending"],
    datasets: [
      {
        data: [cleanCount, moderateCount, dirtyCount, pendingCount],
        backgroundColor: ["#10b981", "#fbbf24", "#ef4444", "#94a3b8"],
        hoverOffset: 15,
        cutout: '72%',
        borderRadius: 6,
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, font: { size: 12, weight: '500' } } },
      tooltip: { backgroundColor: '#1e293b', padding: 12, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 12, weight: '500' } } },
      y: { grid: { color: '#f1f5f9' }, min: 0 }
    }
  };

  const donutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right', labels: { usePointStyle: true, padding: 20, font: { size: 12, weight: '500' } } },
      tooltip: { backgroundColor: '#1e293b', padding: 12, cornerRadius: 8 },
    }
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

          <button className="refresh-btn"
            onClick={fetchData}>
            ⟳ Refresh Data
          </button>
        </div>

        {/* KPI CARDS — ORIGINAL DESIGN RESTORED */}
        <div className="cards">

          <div className="card card-blue">
            <div className="card-content">
              <p className="card-title">Total Toilets</p>
              <h2>{total}</h2>
              <span className="card-sub">All facilities</span>
            </div>
            <div className="card-icon blue">🚿</div>
          </div>

          <div className="card card-green">
            <div className="card-content">
              <p className="card-title">Clean Toilets</p>
              <h2>{clean}</h2>
              <span className="card-sub up">+5% today</span>
            </div>
            <div className="card-icon green">✨</div>
          </div>

          <div className="card card-red">
            <div className="card-content">
              <p className="card-title">Dirty Toilets</p>
              <h2>{dirty}</h2>
              <span className="card-sub danger">Action required</span>
            </div>
            <div className="card-icon red">💧</div>
          </div>

          <div className="card card-yellow">
            <div className="card-content">
              <p className="card-title">Needs Attention</p>
              <h2>{needsAttention}</h2>
              <span className="card-sub">Overdue cleaning</span>
            </div>
            <div className="card-icon yellow">⚠️</div>
          </div>

        </div>

        {/* ANALYTICS SECTION — ENHANCED AESTHETICS */}
        <div className="section modern-analytics">
          <h3 style={{ fontSize: '1.2rem', color: '#1e293b' }}>Usage & Cleanliness Analytics</h3>

          <div className="charts-row">
            <div className="chart bar-chart-container">
              <Bar data={data} options={chartOptions} />
            </div>

            <div className="chart donut-chart-container">
              <Doughnut data={donutData} options={donutOptions} />
            </div>
          </div>
        </div>

        {/* ALERTS SECTION — RE-DESIGNED PER MOCKUP */}
        <div className="alerts-section" style={{ margin: '30px 0' }}>
          <div className="section-header-row">
            <h3 style={{ margin: 0 }}>Active Alerts</h3>
            <span className="view-all-link" onClick={() => navigate('/alerts')}>
              View All &gt;
            </span>
          </div>

          {alerts.length === 0 && (
            <p style={{ color: "green", padding: '10px' }}>
              No alerts. All toilets are clean ✅
            </p>
          )}

          <div className="alerts-list">
            {alerts.map((alert, index) => (
              <div key={index} className="alert-item-card">
                <div className="alert-card-top">
                  <div className="alert-card-id-row">
                    <span className="alert-dot"></span>
                    <span className="alert-toilet-id">{alert.id}</span>
                    <span className={`severity-badge ${alert.severity?.toLowerCase()}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <span className="alert-warning-icon">⚠️</span>
                </div>

                <div className="alert-card-body">
                  <p className="alert-message">{alert.message}</p>
                  <span className="alert-timestamp">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="section modern-predictions" style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#1e293b' }}>AI Cleaning Predictions</h3>

          {predictions.length === 0 && (
            <p style={{ padding: '10px' }}>No predictions available</p>
          )}

          <div className="alerts-list">
            {predictions.map((item, index) => (
              <div key={index} className="alert-item-card">
                <div className="alert-card-top">
                  <div className="alert-card-id-row">
                    <span className="alert-dot" style={{ backgroundColor: '#8b5cf6' }}></span>
                    <span className="alert-toilet-id">T-{String(item.toilet_id).padStart(3, '0')}</span>
                    <span className={`severity-badge ${item.status?.toLowerCase().replace(' ', '-')}`}>
                      {item.status}
                    </span>
                  </div>
                  <span className="alert-warning-icon">🕒</span>
                </div>

                <div className="alert-card-body">
                  <p className="alert-message">
                    {item.status === "data pending" ? 
                      "Waiting for next sensor reading..." : 
                      `Hygo predicts next cleaning in ${item.predicted_minutes} minutes`}
                  </p>
                  <span className="alert-timestamp">AI Powered Forecast</span>
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