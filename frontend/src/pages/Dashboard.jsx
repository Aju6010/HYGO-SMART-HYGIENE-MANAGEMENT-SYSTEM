import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import Sidebar from "../component/Sidebar";
import "../styles/dash.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const [alerts, setAlerts] = useState([]);
  const [toilets, setToilets] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [toiletData, setToiletData] = useState([]); 


 const fetchData = ( ) => { 
     console.log("REFRESH CLICKED");  
  // Alerts
  fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/cleaning-alerts")
    .then(res => res.json())
    .then(data => setAlerts(data));

  // Toilets
  fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/toilets")
    .then(res => res.json())
    .then(data => setToilets(data));

    //  (AI prediction)
  fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/predict-from-db")
    .then(res => res.json())
    .then(data => setPredictions(data))
    .catch(err => console.log("Prediction error:", err));
 };  

  // 🔗 Fetch alerts from Flask (DB)
  useEffect(() => {
    fetchData();
  }, [])

const total = toilets.length;
const dirty = alerts.length;
const clean = total - dirty;


// ===== DYNAMIC DATA =====

// Labels
const labels = predictions.map(t => `T${t.toilet_id}`);

// Data
const usageData = predictions.map(t => t.predicted_minutes || 0);

const cleanlinessData = predictions.map(t => {
  if (t.status === "Clean") return 90;
  if (t.status === "Moderate") return 60;
  return 30;
});

// ✅ ONLY ONE data object
const data = {
  labels,
  datasets: [
    {
      label: "Usage Count",
      data: usageData,
      backgroundColor: "#3DDC84",
    },
    {
      label: "Cleanliness Score",
      data: cleanlinessData,
      backgroundColor: "#0F2027",
    },
  ],
};

// ✅ Correct console log
console.log("API DATA:", toilets);

// ===== PIE CHART =====
const cleanCount = predictions.filter(t => t.status === "Clean").length;
const moderateCount = predictions.filter(t => t.status === "Moderate").length;
const dirtyCount = predictions.filter(t => t.status === "Dirty").length;

const pieData = {
  labels: ["Clean", "Moderate", "Dirty"],
  datasets: [
    {
      data: [cleanCount, moderateCount, dirtyCount],
      backgroundColor: ["#38bdf8", "#facc15", "#f87171"],
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
        <div className="section">
  <h3>AI Cleaning Predictions</h3>

  {predictions.length === 0 && (
    <p>No predictions available</p>
  )}

  <div className="alerts-list">
    {predictions.map((item, index) => (

      <div 
         key={index} 
         className={`alert-card ${
          item.status==="Dirty Soon" ? 
          "critical" : 
          item.status==="Moderate" ? 
          "warning" : 
            "safe"}`}>

        <div className="alert-left">
          <strong>Toilet {item.toilet_id}</strong>
          <p>Next cleaning in {item.predicted_minutes} mins</p>
        </div>

        <div className="alert-right">
          <span>{item.status}</span>
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