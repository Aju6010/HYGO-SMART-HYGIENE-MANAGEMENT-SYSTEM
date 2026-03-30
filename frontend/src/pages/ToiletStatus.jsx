import { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import "../styles/toilet.css";

export default function ToiletStatus() {
  const [toilets, setToilets] = useState([]);

  useEffect(() => {
    fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/toilets")
      .then((res) => res.json())
      .then((data) => setToilets(data))
      .catch((err) => console.error("Error fetching toilets:", err));
  }, []);

  // SUMMARY COUNTS
  const clean = toilets.filter((t) => t.status === "clean").length;
  const dirty = toilets.filter((t) => t.status === "dirty").length;
  const maintenance = toilets.filter((t) => t.status === "maintenance").length;
  const offline = toilets.filter((t) => t.status === "offline").length;

  // SIMPLE SCORE LOGIC (can improve later)
  const getScore = (status) => {
    if (status === "clean") return 90;
    if (status === "dirty") return 40;
    if (status === "maintenance") return 60;
    return 0;
  };
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
   toilet_id: "",
    location: "",
    status: "clean"
  });

  const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

 const handleSubmit = async () => {
  try {
    if (!formData.toilet_id || !formData.location) {
      alert("❌ ID and Location required");
      return;
    }

    const res = await fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/toilets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    let data;

    try{
      data = await res.json();
    } catch{
      data = null;
    }

    if (res.ok) {
      alert("✅ Toilet added successfully");

      setShowModal(false);

      // optional refresh
      window.location.reload();
    } else {
      alert("❌ Failed to add toilet");
    }

  } catch (err) {
    console.error(err);
    alert("❌ Server error");
  }
};
const filteredToilets = toilets.filter((t) => {
  const searchLower = search.toLowerCase();

  return (
    String(t.toilet_id).toLowerCase().includes(searchLower) ||
    (t.location && t.location.toLowerCase().includes(searchLower))
  );
});

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        {/* HEADER */}
        <div className="dash-header">
          <div className="dash-title">
            <h1>Toilet Status</h1>
            <p>Monitor all toilet facilities in real-time</p>
          </div>

          <button onClick={() => setShowModal(true)}
           className="add-btn">
            ＋ Add Toilet</button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="toilet-summary">
          <div className="summary-card clean">
            <h2>{clean}</h2>
            <p>Clean</p>
          </div>

          <div className="summary-card dirty">
            <h2>{dirty}</h2>
            <p>Dirty</p>
          </div>

          <div className="summary-card maintenance">
            <h2>{maintenance}</h2>
            <p>Maintenance</p>
          </div>

          <div className="summary-card offline">
            <h2>{offline}</h2>
            <p>Offline</p>
          </div>
        </div>

        {/* SEARCH (UI ONLY for now) */}
        <div className="toilet-search">
          <input placeholder="Search by ID or location..." 
          value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* TOILET CARDS */}
        <div className="toilet-grid">
          {filteredToilets.map((t) => {
            const score = getScore(t.status);

            return (
              <div className="toilet-card" key={t.toilet_id}>
                <div className={`status-icon ${t.status}`}>
                  {t.status === "clean" ? "✨" : "💧"}
                </div>

                <h3>T-{String(t.toilet_id).padStart(3, "0")}</h3>
                <p className="meta">📍 {t.location}</p>
                <p className="meta">🏢 Facility</p>

                <div className="progress-wrap">
                  <span>Cleanliness</span>
                  <span className="score">{score}%</span>
                </div>

                <div className="progress-bar">
                  <div
                    className={`progress ${t.status}`}
                    style={{ width: `${score}%` }}
                  />
                </div>

                <span className={`status-badge ${t.status}`}>
                  {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {showModal && (
  <div className="modal-overlay">
    <div className="modal-box">

      <h2>Add New Toilet</h2>

      <input name="toilet_id" placeholder="Toilet ID" onChange={handleChange} />
      <input name="location" placeholder="Location" onChange={handleChange} />

      <select name="status" onChange={handleChange}>
        <option value="clean">Clean</option>
        <option value="dirty">Dirty</option>
        <option value="maintenance">Maintenance</option>
      </select>

      <div className="modal-buttons">
        <button onClick={() => setShowModal(false)} className="cancel-btn">
          Cancel
        </button>
        <button onClick={handleSubmit} className="add-btn">
          Add Toilet
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
}