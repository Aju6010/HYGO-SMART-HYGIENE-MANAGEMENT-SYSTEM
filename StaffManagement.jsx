import Sidebar from "../components/Sidebar";
import "../styles/staff.css";

export default function StaffManagement() {
  return (
    <div className="app">
      <Sidebar />

      <div className="main">

        {/* HEADER */}
        <div className="dash-header">
          <div className="dash-title">
            <h1>Staff Management</h1>
            <p>Manage cleaning staff and assignments</p>
          </div>
          <button className="add-btn">＋ Add Staff Member</button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="staff-summary">

          <div className="summary-card">
            <div>
              <p>Total Staff</p>
              <h2>6</h2>
            </div>
            <div className="summary-icon gray">👤</div>
          </div>

          <div className="summary-card active">
            <div>
              <p>On Duty</p>
              <h2>4</h2>
            </div>
            <div className="summary-icon green">✔</div>
          </div>

          <div className="summary-card">
            <div>
              <p>Off Duty</p>
              <h2>1</h2>
            </div>
            <div className="summary-icon gray">🕒</div>
          </div>

        </div>

        {/* SEARCH */}
        <div className="staff-controls">
          <input placeholder="Search by name or ID..." />
          <select>
            <option>All Status</option>
            <option>On Duty</option>
            <option>Off Duty</option>
          </select>
        </div>

        {/* STAFF GRID */}
        <div className="staff-grid">

          {[
            ["M", "Maria Santos", "EMP-001", "Building A", "on", "Cleaner"],
            ["J", "John Williams", "EMP-002", "Building B", "on", "Cleaner"],
            ["S", "Sarah Chen", "EMP-003", "All Buildings", "on", "Supervisor"],
            ["M", "Mike Johnson", "EMP-004", "Building C", "off", "Cleaner"],
          ].map((s, i) => (
            <div className="staff-card" key={i}>
              <div className="staff-top">
                <div className="avatar">{s[0]}</div>
                <div className="staff-actions">✏️ 🗑️</div>
              </div>

              <h3>{s[1]}</h3>
              <p className="staff-id">ID: {s[2]}</p>
              <div className="staff-info">📍 {s[3]}</div>

              <div className="staff-tags">
                <span className={`tag ${s[4]}`}>
                  {s[4] === "on" ? "✔ On Duty" : "🕒 Off Duty"}
                </span>
                <span className="tag role">{s[5]}</span>
              </div>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}
