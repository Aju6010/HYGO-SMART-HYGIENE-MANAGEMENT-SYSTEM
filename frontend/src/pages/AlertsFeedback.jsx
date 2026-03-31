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
  const [staff, setStaff] = useState([]); 

  const [assigningAlertId, setAssigningAlertId] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    toilet: "",
    type: "Cleanliness",
    severity: "Medium",
    message: "",
  });

  const loadData = async () => {
    try {
      const alertRes = await fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/alerts");
      const alertData = await alertRes.json();
      setAlerts(alertData || []);
    } catch (error) {
      console.log("ALERTS API ERROR:", error);
    }

    try {
      const feedbackRes = await fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/feedback");
      const feedbackData = await feedbackRes.json();
      setFeedback(feedbackData || []);
    } catch (error) {
      console.log("FEEDBACK API ERROR:", error);
    }

    try {
      const staffRes = await fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/staff");
      const staffData = await staffRes.json();
      setStaff(staffData || []);
    } catch (error) {
      console.log("STAFF API ERROR:", error);
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

  const filteredFeedback = feedback.filter((fb) => {
    let checkStatus = fb.status || "";
    if (checkStatus.toLowerCase() === "verified") checkStatus = "resolved";
    const statusMatch = statusFilter === "All Status" || (checkStatus.toLowerCase() === statusFilter.toLowerCase());
    const severityMatch = severityFilter === "All Severity" || (fb.severity && fb.severity.toLowerCase() === severityFilter.toLowerCase());
    const searchMatch = (fb.id || "").toLowerCase().includes(searchQuery.toLowerCase()) || (fb.message || "").toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && severityMatch && searchMatch;
  });

  const openAlertsCount = alerts.filter(a => a.status !== "Resolved").length;
  const criticalAlertsCount = alerts.filter((a) => a.severity?.toLowerCase() === "critical").length;
  const resolvedAlertsCount = feedback.filter((f) => f.status === "Verified").length;
  const avgRating = feedback.length > 0 ? (feedback.reduce((sum, f) => sum + Number(f.rating || 0), 0) / feedback.length).toFixed(1) : 0;

  return (
    <div className="main-container app">
      <Sidebar />
      <div className="content main">
        <header className="dash-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h1 style={{ fontSize: "24px", color: "#1e293b", margin: "0" }}>Alerts & Feedback</h1>
            <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>Monitor alerts and user feedback</p>
          </div>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            + Create Alert
          </button>
        </header>

        <div className="toilet-summary">
          <div className="summary-card open-alerts">
            <div className="icon">⚠️</div>
            <div>
              <h2 style={{ margin: 0 }}>{openAlertsCount}</h2>
              <p style={{ margin: 0, color: "#64748b" }}>Open Alerts</p>
            </div>
          </div>
          <div className="summary-card critical">
            <div className="icon">🚨</div>
            <div>
              <h2 style={{ margin: 0 }}>{criticalAlertsCount}</h2>
              <p style={{ margin: 0, color: "#64748b" }}>Critical</p>
            </div>
          </div>
          <div className="summary-card resolved">
            <div className="icon">✅</div>
            <div>
              <h2 style={{ margin: 0 }}>{resolvedAlertsCount}</h2>
              <p style={{ margin: 0, color: "#64748b" }}>Resolved</p>
            </div>
          </div>
          <div className="summary-card rating">
            <div className="icon" style={{ color: "#f59e0b" }}>⭐</div>
            <div>
              <h2 style={{ margin: 0 }}>{avgRating}</h2>
              <p style={{ margin: 0, color: "#64748b" }}>Avg Rating</p>
            </div>
          </div>
        </div>

        <div className="filter-bar">
          <div className="tabs">
            <button className={`tab ${activeTab === "alerts" ? "active" : ""}`} onClick={() => setActiveTab("alerts")}>Alerts ({alerts.length})</button>
            <button className={`tab ${activeTab === "feedback" ? "active" : ""}`} onClick={() => setActiveTab("feedback")}>Feedback ({feedback.length})</button>
          </div>
          
          <div className="search-row">
            <input className="search-input" type="text" placeholder="Search alerts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All Status</option><option>Open</option><option>Acknowledged</option><option>Resolved</option>
            </select>
            <select className="filter-select" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option>All Severity</option><option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
            </select>
          </div>
        </div>

        <div className="alerts-container">
          {activeTab === "alerts" ? (
            filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <div key={alert.id} style={{ display: "flex", flexDirection: "column" }}>
                  <div className="alert-strip-card">
                    <div className={`alert-icon-box ${alert.severity?.toLowerCase()}`}>!</div>
                    <div className="alert-content">
                      <div className="alert-meta-row">
                        <span className="alert-id">{alert.id}</span>
                        <span className={`badge sev-${alert.severity?.toLowerCase()}`}>{alert.severity}</span>
                        <span className={`badge status-${alert.status?.toLowerCase().replace(" ", "-")}`}>{alert.status}</span>
                        <span className="badge type-tag">{alert.type || 'Sensor'}</span>
                      </div>
                      <p className="alert-msg">{alert.message}</p>
                      <span className="alert-time">🕒 {alert.time}</span>
                    </div>
                    <button className="action-btn" onClick={() => setAssigningAlertId(alert.id)}>Acknowledge</button>
                  </div>

                  {/* Fixed Staff Dropdown overlay format */}
                  {assigningAlertId === alert.id && (
                    <div style={{ marginTop: "10px", padding: "15px", background: "white", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <h4 style={{ margin: 0 }}>Assign Staff to {alert.id}</h4>
                        <button style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "16px" }} onClick={() => setAssigningAlertId(null)}>×</button>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <select className="filter-select" style={{ flex: 1 }} value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}>
                          <option value="">Select available staff</option>
                          {staff.filter(s => s.attendance_status === "Present").map((s) => (
                            <option key={s.staff_id} value={s.staff_id}>{s.name} (ID: {s.staff_id})</option>
                          ))}
                        </select>
                        <button className="add-btn" onClick={() => handleConfirmAssignment(alert.id)}>Confirm</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>No active alerts</div>
            )
          ) : (
            filteredFeedback.length > 0 ? (
              filteredFeedback.map((fb, index) => (
                <div key={index} className="alert-strip-card">
                  <div className="alert-icon-box" style={{ background: "#f1f5f9", color: "#64748b" }}>💬</div>
                  <div className="alert-content">
                    <div className="alert-meta-row">
                      <span className="alert-id">{fb.id}</span>
                      <span className={`badge sev-${fb.severity?.toLowerCase() || 'low'}`}>{fb.severity || 'Low'}</span>
                      <span className={`badge status-${fb.status?.toLowerCase().replace(" ", "-") || 'default'}`}>{fb.status}</span>
                      <span className="badge type-tag">{fb.type || 'Feedback'}</span>
                    </div>
                    <p className="alert-msg">{fb.message}</p>
                    <div className="rating" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '15px' }}>
                      <div style={{ color: "#facc15" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} style={{ color: star <= fb.rating ? "#facc15" : "#e2e8f0" }}>★</span>
                        ))}
                      </div>
                      <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '4px' }}>({fb.rating}/5)</span>
                    </div>
                    <span className="alert-time" style={{ marginTop: '8px', display: 'block' }}>🕒 {fb.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>No feedback available</div>
            )
          )}
        </div>
      </div>
    </div>
  );
}