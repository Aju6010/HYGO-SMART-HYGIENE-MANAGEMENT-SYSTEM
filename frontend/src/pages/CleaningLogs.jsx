import React, { useState, useEffect } from 'react';
import "../styles/CleaningLogs.css";
import { API_BASE_URL } from "../config";

const CleaningLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    fetch(`${API_BASE_URL}/api/report/logs`)
      .then(res => res.json())
      .then(data => {
        const formattedLogs = data.map((log, index) => ({
          id: index + 1,
          toiletId: log.toilet,
          location: "Facility", // Default or custom location
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
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  // Function to download logs as CSV using live data
  const handleDownload = () => {
    // CSV headers
    const headers = ['Log ID', 'Toilet ID', 'Location', 'Cleaned By', 'Completion Time', 'Status'];
    
    // CSV rows from live state
    const rows = logs.map(log => [
      log.id,
      log.toiletId,
      log.location,
      log.staff,
      log.time,
      log.status
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cleaning_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="logs-container">
      <div className="logs-header">
        <h2>Cleaning Maintenance Logs</h2>
        <button className="export-btn" onClick={handleDownload} disabled={loading || logs.length === 0}>
          Download Report (CSV)
        </button>
      </div>

      {loading && (
        <p style={{ padding: "20px" }}>Loading logs...</p>
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
                    <span className={`status-pill ${log.status === 'Completed' ? 'status-completed' : 'status-pending'}`}>
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