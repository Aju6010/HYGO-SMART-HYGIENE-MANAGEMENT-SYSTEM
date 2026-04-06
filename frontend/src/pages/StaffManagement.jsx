import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ ADD THIS
import Sidebar from "../component/Sidebar";
import "../styles/staff.css";
import { API_BASE_URL } from "../config";

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/staff`)
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

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    score: "",
    gender: "",
    dob: "",
    aadhar: "",
    mother_tongue: "",
    category: "",
    address: "",
    status: "on"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  console.log(formData);
  const handleSubmit = async () => {

    try {
      if (!formData.name || !formData.phone) {
        alert("❌ Name and Phone are required");
        return;
      }
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Staff added successfully");

        setFormData({
          name: "",
          phone: "",
          score: "",
          gender: "",
          address: "",
          status: "on",
        })
        setShowModal(false);
      } else {
        alert("❌ fail to connect to Server");
      }

    } catch (err) {
      console.error(err);
      alert("❌ Server error");
    }
    setLoading(false);
  };

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
            onClick={() => setShowModal(true)}
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
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-box">

              <h2>Add New Staff Member</h2>

              <input name="name" placeholder="Name"
                value={formData.name} onChange={handleChange} />
              <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
              <input name="score" type="number" placeholder="Score" value={formData.score} onChange={handleChange} />

              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              <input name="dob" type="date" onChange={handleChange} />
              <input name="aadhar" placeholder="Aadhar" onChange={handleChange} />
              <input name="mother_tongue" placeholder="Mother Tongue" onChange={handleChange} />
              <input name="category" placeholder="Category" onChange={handleChange} />
              <input name="address" placeholder="Address" onChange={handleChange} />

              <select name="status" onChange={handleChange}>
                <option value="on">On Duty</option>
                <option value="off">Off Duty</option>
              </select>

              <div className="modal-buttons">
                <button onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button onClick={handleSubmit} className="add-btn" disabled={!formData.name}
                >
                  Add Staff
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}