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
          <input placeholder="Search by ID or location..." />
        </div>

        {/* TOILET CARDS */}
        <div className="toilet-grid">
          {toilets.map((t) => {
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
    </div>
  );
}