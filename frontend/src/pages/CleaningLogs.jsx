import React, { useState, useEffect } from 'react';
import "../styles/CleaningLogs.css";

const CleaningLogs = () => {

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {

    fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/report/logs")
      .then(res => res.json())
      .then(data => {

        const formattedLogs = data.map((log, index) => ({
          id: index + 1,
          toiletId: log.toilet,
          location: "Facility",
          staff: log.staff,
          time: log.time,
          status: log.score === "Verified" ? "Completed" : "Pending"
        }));

        setLogs(formattedLogs);
        setLoading(false);

      })
      .catch(err => {
        console.log("Error fetching logs:", err);
        setLoading(false);
      });

  };

  useEffect(() => {

    // initial load
    fetchLogs();

    // auto refresh every 10 seconds
    const interval = setInterval(() => {
      fetchLogs();
    }, 10000);

    return () => clearInterval(interval);

  }, []);

  return (
    <div className="logs-container">

      <div className="logs-header">
        <h2>Cleaning Maintenance Logs</h2>
        <button className="export-btn">Download Report (CSV)</button>
      </div>

      {loading && (
        <p style={{padding:"20px"}}>Loading logs...</p>
      )}

      {!loading && (

        <div className="table-responsive">

          <table className="logs-table">

            <thead>
              <tr>
                <th>Log ID</th>
                <th>Toilet ID</th>
                <th>Location</th>
                <th>Cleaned By</th>
                <th>Completion Time</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {logs.map((log) => (

                <tr key={log.id}>
                  <td>#{log.id}</td>
                  <td className="bold-text">{log.toiletId}</td>
                  <td>{log.location}</td>
                  <td>{log.staff}</td>
                  <td>{log.time}</td>

                  <td>
                    <span className={`status-pill ${
                      log.status === "Completed"
                        ? "status-completed"
                        : "status-pending"
                    }`}>
                      {log.status}
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
};

export default CleaningLogs;