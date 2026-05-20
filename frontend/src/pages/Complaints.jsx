import React, { useState, useEffect } from 'react';
import "../styles/Complaints.css";
import { API_BASE_URL } from "../config";

const Complaints = () => {
  const [complaint, setComplaint] = useState("");
  const [category, setCategory] = useState("Hygiene Issue");
  const [submitted, setSubmitted] = useState(false);
  const [recentComplaints, setRecentComplaints] = useState([]);

  // Fetch complaints from live API
  const fetchComplaints = () => {
    fetch(`${API_BASE_URL}/api/complaints`)
      .then(res => res.json())
      .then(data => {
        setRecentComplaints(data);
      })
      .catch(err => {
        console.log("Error fetching complaints:", err);
      });
  };

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 10000);
    return () => clearInterval(interval);
  }, []);

  // Live submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (complaint.trim().length < 10) {
      alert("Please provide more details (at least 10 characters).");
      return;
    }

    const staffId = localStorage.getItem("staff_id");
    fetch(`${API_BASE_URL}/api/complaints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        category: category,
        description: complaint,
        staff_id: staffId
      })
    })
      .then(res => res.json())
      .then(data => {
        setSubmitted(true);
        setComplaint("");
        fetchComplaints();
      })
      .catch(err => {
        console.log("Submit error:", err);
      });
  };

  // Helper to map category names to your CSS badge classes
  const getBadgeClass = (cat) => {
    if (!cat) return "";
    const lower = cat.toLowerCase();
    if (lower.includes("hygiene")) return "hygiene";
    if (lower.includes("technical")) return "technical";
    if (lower.includes("plumbing") || lower.includes("water")) return "plumbing";
    return "";
  };

  return (
    <div className="complaints-page">
      <h1 className="page-title">File a Complaint</h1>
      <div className="complaints-container">
        <div className="complaints-card">
          <h2>Report a Complaint</h2>
          <p>Your feedback helps us maintain the HYGO standards. Please describe the issue clearly.</p>

          {submitted ? (
            <div className="success-banner">
              <h3>Complaint Submitted Successfully!</h3>
              <p>The authority has been notified. We will look into it shortly.</p>
              <button onClick={() => setSubmitted(false)}>File Another Complaint</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="complaints-form">
              <div className="form-group">
                <label>Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Hygiene Issue">Hygiene Issue</option>
                  <option value="Technical Malfunction">Technical Malfunction (Sensor/IoT)</option>
                  <option value="Plumbing/Water Issue">Plumbing/Water Issue</option>
                  <option value="Supply Shortage">Supply Shortage (Soap/Paper)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Detailed Description</label>
                <textarea
                  rows="6"
                  placeholder="Describe the issue, including the specific location or toilet ID..."
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                ></textarea>
                <small className="char-count">{complaint.length} characters</small>
              </div>

              <button type="submit" className="submit-complaint-btn">
                Submit Complaint
              </button>
            </form>
          )}
        </div>

        <div className="recent-complaints-card">
          <h2>Recent Complaints</h2>
          <div className="complaints-list">
            {recentComplaints.length === 0 && (
              <p style={{ color: "#64748b" }}>No complaints reported yet.</p>
            )}
            {recentComplaints.map((c) => (
              <div key={c.complaint_id} className="complaint-item">
                <div className="complaint-header">
                  <span className={`category-badge ${getBadgeClass(c.category)}`}>
                    {c.category}
                  </span>
                  <span className="complaint-date">{c.time}</span>
                </div>
                <p className="complaint-desc">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaints;