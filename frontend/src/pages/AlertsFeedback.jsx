import { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import "../styles/alert.css";

export default function AlertsFeedback() {
  const [activeTab, setActiveTab] = useState("alerts");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [severityFilter, setSeverityFilter] = useState("All Severity");
  const [searchQuery, setSearchQuery] = useState("");

  const [alerts, setAlerts] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [staff, setStaff] = useState([]); // State to hold DB staff names

  const [assigningAlertId, setAssigningAlertId] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    toilet: "",
    type: "Cleanliness",
    severity: "Medium",
    message: "",
  });

  // ── Database Fetching ──
  const loadData = async () => {
    try {
      // 1. Fetch Alerts
      const alertRes = await fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/alerts");
      const alertData = await alertRes.json();
      setAlerts(alertData || []);

      // 2. Fetch Feedback
      const feedbackRes = await fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/feedback");
      const feedbackData = await feedbackRes.json();
      setFeedback(feedbackData || []);

      // 3. Fetch Staff Names from your DB (IMPORTANT)
      const staffRes = await fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/staff");
      const staffData = await staffRes.json();
      console.log("Staff from DB:", staffData); // Check your console to see the structure
      setStaff(staffData || []);
    } catch (error) {
      console.log("API ERROR:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmAssignment = async (alertId) => {
    if (!selectedStaff) return alert("Please select a staff member");

    try {
      const response = await fetch(`https://hygo-smart-hygiene-management-system.onrender.com/api/alerts/${alertId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          staff_id: selectedStaff,
          status: "Acknowledged" 
        }),
      });

      if (response.ok) {
        setAssigningAlertId(null);
        setSelectedStaff("");
        loadData(); 
      }
    } catch (error) {
      console.error("DB Update Error:", error);
    }
  };

  const handleCreateAlert = async () => {
    if (!newAlert.toilet || !newAlert.message) return;
    try {
      await fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlert),
      });
      loadData();
    } catch (e) { console.log(e); }
    setShowModal(false);
    setNewAlert({ toilet: "", type: "Cleanliness", severity: "Medium", message: "" });
  };

  const filteredAlerts = alerts.filter((alert) => {
    const statusMatch = statusFilter === "All Status" || (alert.status && alert.status.toLowerCase() === statusFilter.toLowerCase());
    const severityMatch = severityFilter === "All Severity" || (alert.severity && alert.severity.toLowerCase() === severityFilter.toLowerCase());
    const searchMatch = (alert.id || "").toLowerCase().includes(searchQuery.toLowerCase()) || (alert.message || "").toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && severityMatch && searchMatch;
  });

  const openAlertsCount = alerts.filter(a => a.status !== "Resolved").length;
  const criticalAlertsCount = alerts.filter((a) => a.severity?.toLowerCase() === "critical").length;
  const resolvedAlertsCount = feedback.filter((f) => f.status === "Verified").length;
  const avgRating = feedback.length > 0 ? (feedback.reduce((sum, f) => sum + Number(f.rating || 0), 0) / feedback.length).toFixed(1) : 0;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <header className="dash-header">
          <div className="header-left">
            <h1>Alerts & Feedback</h1>
            <p>Monitor alerts and user feedback</p>
          </div>
        </header>

        <div className="summary-grid">
          <div className="stat-card">
            <div className="stat-icon red-icon">⚠️</div>
            <div className="stat-info"><h3>{openAlertsCount}</h3><p>Open Alerts</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange-icon">🚨</div>
            <div className="stat-info"><h3>{criticalAlertsCount}</h3><p>Critical</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green-icon">✅</div>
            <div className="stat-info"><h3>{resolvedAlertsCount}</h3><p>Resolved</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow-icon">⭐</div>
            <div className="stat-info"><h3>{avgRating}</h3><p>Avg Rating</p></div>
          </div>
        </div>

        <div className="tab-navigation">
          <button className={`tab-btn ${activeTab === "alerts" ? "active" : ""}`} onClick={() => setActiveTab("alerts")}>Alerts ({alerts.length})</button>
          <button className={`tab-btn ${activeTab === "feedback" ? "active" : ""}`} onClick={() => setActiveTab("feedback")}>Feedback ({feedback.length})</button>
        </div>

        <div className="filter-section">
          <div className="search-box">
            <input type="text" placeholder="Search alerts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="filter-group">
            <select className="custom-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All Status</option><option>Open</option><option>Acknowledged</option><option>Resolved</option>
            </select>
            <select className="custom-select" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option>All Severity</option><option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
            </select>
          </div>
        </div>

        <div className="list-container">
          {activeTab === "alerts" ? (
            filteredAlerts.map((alert) => (
              <div key={alert.id} className="item-wrapper">
                <div className="data-card">
                  <div className={`icon-indicator sev-bg-${alert.severity?.toLowerCase()}`}>!</div>
                  <div className="card-body">
                    <div className="meta-top">
                      <span className="item-id">{alert.id}</span>
                      <span className={`badge sev-${alert.severity?.toLowerCase()}`}>{alert.severity}</span>
                      <span className={`badge status-${alert.status?.toLowerCase().replace(" ", "-")}`}>{alert.status}</span>
                    </div>
                    <p className="item-message">{alert.message}</p>
                    <div className="item-footer">
                      <span className="item-time">🕒 {alert.time}</span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button className="btn-outline" onClick={() => setAssigningAlertId(alert.id)}>Acknowledge</button>
                  </div>
                </div>

                {/* ── Fixed Staff Dropdown ── */}
                {assigningAlertId === alert.id && (
                  <div className="assignment-panel">
                    <div className="assign-header">
                      <h4>Assign Staff to {alert.id}</h4>
                      <button className="close-btn" onClick={() => setAssigningAlertId(null)}>×</button>
                    </div>
                    <div className="assign-controls">
                      <select 
                        className="custom-select" 
                        value={selectedStaff} 
                        onChange={(e) => setSelectedStaff(e.target.value)}
                      >
                        <option value="">Select available staff</option>
                        {staff.length > 0 ? (
                          staff
                            .filter(s => s.attendance_status === "Present") // Shows only those marked Present in DB
                            .map((s) => (
                              <option key={s.staff_id} value={s.staff_id}>
                                {s.name} (ID: {s.staff_id})
                              </option>
                            ))
                        ) : (
                          <option disabled>Loading staff from DB...</option>
                        )}
                      </select>
                      <button className="create-alert-btn" onClick={() => handleConfirmAssignment(alert.id)}>Confirm</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-data">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}