import { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import "../styles/alert.css";

export default function AlertsFeedback() {

  const [activeTab, setActiveTab] = useState("alerts");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [severityFilter, setSeverityFilter] = useState("All Severity");

  const [alerts, setAlerts] = useState([]);
  const [feedback, setFeedback] = useState([]);

  // FETCH DATA FROM FLASK
  useEffect(() => {

    const loadData = async () => {
      try {

        const alertRes = await fetch("http://127.0.0.1:5000/api/alerts");
        const alertData = await alertRes.json();
        setAlerts(alertData || []);

        const feedbackRes = await fetch("http://127.0.0.1:5000/api/feedback");
        const feedbackData = await feedbackRes.json();
        setFeedback(feedbackData || []);

      } catch (error) {
        console.log("API ERROR:", error);
      }
    };

    loadData();

  }, []);

  // FILTER ALERTS
  const filteredAlerts = alerts.filter((alert) => {

    const statusMatch =
      statusFilter === "All Status" ||
      (alert.status && alert.status.toLowerCase() === statusFilter.toLowerCase());

    const severityMatch =
      severityFilter === "All Severity" ||
      (alert.severity && alert.severity.toLowerCase() === severityFilter.toLowerCase());

    return statusMatch && severityMatch;
  });

  // SUMMARY
  const openAlerts = alerts.length;

  const criticalAlerts = alerts.filter(
    (a) => a.severity && a.severity.toLowerCase() === "critical"
  ).length;

  const resolvedAlerts = feedback.filter(
    (f) => f.status === "Verified"
  ).length;

  const avgRating =
    feedback.length > 0
      ? (
          feedback.reduce((sum, f) => sum + Number(f.rating || 0), 0) /
          feedback.length
        ).toFixed(1)
      : 0;

  return (
    <div className="app">
      <Sidebar />

      <div className="main">

        {/* HEADER */}
        <div className="dash-header">
          <div className="dash-title">
            <h1>Alerts & Feedback</h1>
            <p>Monitor alerts and user feedback</p>
          </div>

          <button className="add-btn">＋ Create Alert</button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="toilet-summary">

          <div className="summary-card open-alerts">
            <span className="icon">⚠️</span>
            <div>
              <h2>{openAlerts}</h2>
              <p>Open Alerts</p>
            </div>
          </div>

          <div className="summary-card critical">
            <span className="icon">🚨</span>
            <div>
              <h2>{criticalAlerts}</h2>
              <p>Critical</p>
            </div>
          </div>

          <div className="summary-card resolved">
            <span className="icon">✅</span>
            <div>
              <h2>{resolvedAlerts}</h2>
              <p>Resolved</p>
            </div>
          </div>

          <div className="summary-card rating">
            <span className="icon">⭐</span>
            <div>
              <h2>{avgRating}</h2>
              <p>Avg Rating</p>
            </div>
          </div>

        </div>

        {/* TABS */}
        <div className="tabs">

          <button
            className={activeTab === "alerts" ? "tab active" : "tab"}
            onClick={() => setActiveTab("alerts")}
          >
            Alerts ({alerts.length})
          </button>

          <button
            className={activeTab === "feedback" ? "tab active" : "tab"}
            onClick={() => setActiveTab("feedback")}
          >
            Feedback ({feedback.length})
          </button>

        </div>

        {/* SEARCH + FILTERS */}

        <div className="search-row">

          <input
            type="text"
            placeholder="Search alerts..."
            className="search-input"
          />

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Open</option>
            <option>Acknowledged</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>

          <select
            className="filter-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option>All Severity</option>
            <option>low</option>
            <option>medium</option>
            <option>high</option>
            <option>critical</option>
          </select>

        </div>

        {/* ALERTS TAB */}
        {activeTab === "alerts" && (
          <div className="alerts-container">

            {filteredAlerts.map((alert) => (

              <div className="alert-strip-card" key={alert.id}>

                <div className={`alert-icon-box ${alert.severity}`}>
                  {alert.severity === "critical" ? "!" : "🔔"}
                </div>

                <div className="alert-content">

                  <div className="alert-meta-row">

                    <span className="alert-id">{alert.id}</span>

                    <span className={`badge sev-${alert.severity}`}>
                      {alert.severity}
                    </span>

                    <span className="badge status-open">
                      {alert.status}
                    </span>

                    <span className="badge type-tag">
                      📦 {alert.type}
                    </span>

                  </div>

                  <p className="alert-msg">{alert.message}</p>

                  <span className="alert-time">
                    🕒 {alert.time}
                  </span>

                </div>

                <div className="alert-actions">

                  <button className="action-btn">
                    {alert.status === "Acknowledged"
                      ? "Start Work"
                      : "Acknowledge"}
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

        {/* FEEDBACK TAB */}
        {activeTab === "feedback" && (

          <div className="alerts-container">

            {feedback.map((fb) => (

              <div className="alert-strip-card" key={fb.id}>

                <div className="alert-icon-box feedback">💬</div>

                <div className="alert-content">

                  <div className="alert-meta-row">

                    <span className="alert-id">{fb.id}</span>

                    <span className="badge sev-low">low</span>

                    <span className="badge status-resolved">
                      {fb.status}
                    </span>

                    <span className="badge type-tag">
                      💬 Feedback
                    </span>

                  </div>

                  <p className="alert-msg">{fb.message}</p>

                  <div className="rating">
                    {"⭐".repeat(Number(fb.rating || 0))}
                    {"☆".repeat(5 - Number(fb.rating || 0))}
                    <span> ({fb.rating}/5)</span>
                  </div>

                  <span className="alert-time">
                    🕒 {fb.time}
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
    </div>
  );
}