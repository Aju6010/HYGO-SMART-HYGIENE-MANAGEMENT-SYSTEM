import Sidebar from "../components/Sidebar";
import "../styles/toilet.css";

export default function ToiletStatus() {
  const toilets = [
    {
      id: "T-001",
      location: "Building A - Lobby",
      floor: "Floor G",
      status: "clean",
      score: 95,
    },
    {
      id: "T-002",
      location: "Building A - West Wing",
      floor: "Floor 1",
      status: "clean",
      score: 88,
    },
    {
      id: "T-003",
      location: "Building B - Main Hall",
      floor: "Floor G",
      status: "dirty",
      score: 42,
    },
    {
      id: "T-004",
      location: "Building B - East Wing",
      floor: "Floor 1",
      status: "clean",
      score: 90,
    },
  ];

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

          <button className="add-btn">＋ Add Toilet</button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="toilet-summary">
          <div className="summary-card clean">
            <h2>5</h2>
            <p>Clean</p>
          </div>

          <div className="summary-card dirty">
            <h2>2</h2>
            <p>Dirty</p>
          </div>

          <div className="summary-card maintenance">
            <h2>1</h2>
            <p>Maintenance</p>
          </div>

          <div className="summary-card offline">
            <h2>0</h2>
            <p>Offline</p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="toilet-search">
          <input placeholder="Search by ID or location..." />
        </div>

        {/* TOILET CARDS */}
        <div className="toilet-grid">
          {toilets.map((t) => (
            <div className="toilet-card" key={t.id}>
              <div className={`status-icon ${t.status}`}>
                {t.status === "clean" ? "✨" : "💧"}
              </div>

              <h3>{t.id}</h3>
              <p className="meta">📍 {t.location}</p>
              <p className="meta">🏢 {t.floor}</p>

              <div className="progress-wrap">
                <span>Cleanliness</span>
                <span className="score">{t.score}%</span>
              </div>

              <div className="progress-bar">
                <div
                  className={`progress ${t.status}`}
                  style={{ width: `${t.score}%` }}
                />
              </div>

              <span className={`status-badge ${t.status}`}>
                {t.status === "clean" ? "Clean" : "Dirty"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
