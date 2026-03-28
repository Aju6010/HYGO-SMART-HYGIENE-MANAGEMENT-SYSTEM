import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ ADD THIS
import Sidebar from "../component/Sidebar";
import "../styles/staff.css";

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/staff")
      .then((res) => res.json())
      .then((data) => setStaff(data))
      .catch((err) => console.error("Error fetching staff:", err));
  }, []);

  // ✅ SUMMARY COUNTS (correct)
  const totalStaff = staff.length;
  const onDuty = staff.filter((s) => s.status === "on").length;
  const offDuty = staff.filter((s) => s.status === "off").length;

  // ✅ COMBINED FILTER (search + dropdown)
  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      String(s.staff_id).includes(search);

    const matchesFilter =
      filter === "all" || s.status === filter;

    return matchesSearch && matchesFilter;
  });

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
          <button
            onClick={() => navigate("/add-staff")}
            className="add-btn"
          >
            ＋ Add Staff Member
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="staff-summary">
          <div className="summary-card">
            <div>
              <p>Total Staff</p>
              <h2>{totalStaff}</h2>
            </div>
            <div className="summary-icon gray">👤</div>
          </div>

          <div className="summary-card active">
            <div>
              <p>On Duty</p>
              <h2>{onDuty}</h2>
            </div>
            <div className="summary-icon green">✔</div>
          </div>

          <div className="summary-card">
            <div>
              <p>Off Duty</p>
              <h2>{offDuty}</h2>
            </div>
            <div className="summary-icon gray">🕒</div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="staff-controls">
          <input
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)} // ✅ FIXED
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)} // ✅ FIXED
          >
            <option value="all">All Status</option>
            <option value="on">On Duty</option>
            <option value="off">Off Duty</option>
          </select>
        </div>

        {/* STAFF GRID */}
        <div className="staff-grid">
          {filteredStaff.map((s) => (
            <div className="staff-card" key={s.staff_id}>
              <div className="staff-top">
                <div className="avatar">{s.name.charAt(0)}</div>
                <div className="staff-actions">✏️ 🗑️</div>
              </div>

              <h3>{s.name}</h3>
              <p className="staff-id">ID: EMP-{s.staff_id}</p>
              <div className="staff-info">⭐ Score: {s.score}</div>

              <div className="staff-tags">
                <span className={`tag ${s.status}`}>
                  {s.status === "on" ? "✔ On Duty" : "🕒 Off Duty"}
                </span>
                <span className="tag role">Cleaner</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}