import { Bar,Pie } from "react-chartjs-2";
import "chart.js/auto";
import Sidebar from "../component/Sidebar";
import "../styles/dash.css";

export default function Dashboard() {

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
      data: [70, 20, 10],   // % distribution
      backgroundColor: [
        "#38bdf8",   // clean (blue)
        "#facc15",   // moderate (yellow)
        "#f87171",   // dirty (red)
      ],
      borderWidth: 0,
    },
  ],
};

  const alerts = [
  {
    id: "T03",
    issue: "Odour Level High",
    time: "10:20 AM",
    status: "critical",
  },
  {
    id: "T07",
    issue: "Cleaning Pending",
    time: "09:45 AM",
    status: "warning",
  },
  {
    id: "T01",
    issue: "Low Cleanliness Score",
    time: "09:10 AM",
    status: "warning",
  },
];


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

        <button className="refresh-btn">
          ⟳ Refresh Data
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="content">
        <div class="cards">

  <div class="card card-blue">
    <div class="card-content">
      <p class="card-title">Total Toilets</p>
      <h2>8</h2>
      <span class="card-sub">All facilities</span>
    </div>
    <div class="card-icon blue">
      🚿
    </div>
  </div>

  <div class="card card-green">
    <div class="card-content">
      <p class="card-title">Clean Toilets</p>
      <h2>5</h2>
      <span class="card-sub up">+5% today</span>
    </div>
    <div class="card-icon green">
      ✨
    </div>
  </div>

  <div class="card card-red">
    <div class="card-content">
      <p class="card-title">Dirty Toilets</p>
      <h2>2</h2>
      <span class="card-sub danger">Needs attention</span>
    </div>
    <div class="card-icon red">
      💧
    </div>
  </div>

  <div class="card card-yellow">
    <div class="card-content">
      <p class="card-title">Active Alerts</p>
      <h2>3</h2>
      <span class="card-sub">Requires action</span>
    </div>
    <div class="card-icon yellow">
      ⚠️
    </div>
  </div>

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

      {/* ALERTS SECTION (SEPARATE) */}
      <div className="alerts-section">
        <h3>Active Alerts</h3>

        <div className="alerts-list">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`alert-card ${alert.status}`}
            >
              <div className="alert-left">
                <strong>{alert.id}</strong>
                <p>{alert.issue}</p>
              </div>

              <div className="alert-right">
                <span>{alert.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>

  </div>
  
  );
}
