import { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import "../styles/reports.css";

import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
PieChart,
Pie,
Cell,
} from "recharts";

export default function Reports() {

const [cleaningData, setCleaningData] = useState([]);
const [pieData, setPieData] = useState([]);
const [performers, setPerformers] = useState([]);
const [logs, setLogs] = useState([]);

const [summary, setSummary] = useState({
total_cleanings: 0,
avg_duration: "0 min",
verification_rate: "0%",
alerts_resolved: 0
});

useEffect(() => {

async function loadReports() {

  try {

    // DAILY CLEANINGS
    const cleanings = await fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/report/cleanings");
    const cleaningsData = await cleanings.json();
    setCleaningData(cleaningsData || []);

    // PIE DATA
    const types = await fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/report/types");
    const typesData = await types.json();
    setPieData(typesData || []);

    // TOP STAFF
    const staff = await fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/report/top-staff");
    const staffData = await staff.json();
    setPerformers(staffData || []);

    // RECENT LOGS
    const logsRes = await fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/report/logs");
    const logsData = await logsRes.json();
    setLogs(logsData || []);

    // SUMMARY
    const summaryRes = await fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/report/summary");
    const summaryData = await summaryRes.json();

    setSummary({
      total_cleanings: summaryData.total_cleanings || 0,
      avg_duration: summaryData.avg_duration || "0 min",
      verification_rate: summaryData.verification_rate || "0%",
      alerts_resolved: summaryData.alerts_resolved || 0
    });

  } catch (error) {
    console.log("Report API Error:", error);
  }

}

loadReports();

}, []);

return (
<div className="app">

  <Sidebar/>

  <div className="main">

    <div className="dash-header">
      <div>
        <h1>Reports</h1>
        <p>Analytics and performance insights</p>
      </div>

      <div className="report-actions">
        <button className="filter-btn">📅 Last 7 Days</button>
        <button className="export-btn">⬇ Export</button>
      </div>
    </div>

    {/* SUMMARY CARDS */}

    <div className="report-summary">

      <div className="summary-card green">
        <p>Total Cleanings</p>
        <h2>{summary.total_cleanings}</h2>
      </div>

      <div className="summary-card blue">
        <p>Avg Duration</p>
        <h2>{summary.avg_duration}</h2>
      </div>

      <div className="summary-card purple">
        <p>Verification Rate</p>
        <h2>{summary.verification_rate}</h2>
      </div>

      <div className="summary-card yellow">
        <p>Alerts Resolved</p>
        <h2>{summary.alerts_resolved}</h2>
      </div>

    </div>

    {/* BAR CHART */}

    <div className="chart-card">

      <h3>Daily Cleaning Activity</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={cleaningData}>
          <XAxis dataKey="day"/>
          <YAxis/>
          <Tooltip/>
          <Bar dataKey="cleanings" fill="#cbd5f5"/>
        </BarChart>
      </ResponsiveContainer>

    </div>

    {/* PIE CHART */}

    <div className="chart-card">

      <h3>Cleaning Types Distribution</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>

          <Pie
            data={pieData}
            dataKey="value"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={5}
          >

            {pieData.map((entry,index)=>(
              <Cell key={index} fill={entry.color}/>
            ))}

          </Pie>

          <Tooltip/>

        </PieChart>
      </ResponsiveContainer>

    </div>

    {/* TOP PERFORMERS */}

    <div className="performers-card">

      <h3>Top Performers</h3>

      {performers.map((p,index)=>(
        <div className="performer" key={index}>

          <div className="rank">{index+1}</div>

          <div className="perf-info">
            <strong>{p.name}</strong>
            <p>{p.cleanings} cleanings</p>
          </div>

          <div className="perf-score">
            {p.cleanings}
          </div>

        </div>
      ))}

    </div>

    {/* RECENT LOGS */}

    <div className="logs-card">

      <h3>Recent Cleaning Logs</h3>

      <table>

        <thead>
          <tr>
            <th>Toilet</th>
            <th>Staff</th>
            <th>Type</th>
            <th>Duration</th>
            <th>Score</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>

          {logs.map((log,index)=>(
            <tr key={index}>
              <td>{log.toilet}</td>
              <td>{log.staff}</td>
              <td>
                <span className="tag">{log.type}</span>
              </td>
              <td>{log.duration}</td>
              <td>{log.score}</td>
              <td>{log.time}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>

  </div>
</div>

);
}