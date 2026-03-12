import React, { useState } from 'react';
import "../styles/CleaningLogs.css";

const CleaningLogs = () => {
  // 1. Added a 'status' field to each log entry
  const [logs] = useState([
    { id: 101, toiletId: 'T-01', location: 'Main Lobby - Ground Floor', staff: 'John', time: '2026-03-01 10:30 AM', status: 'Completed' },
    { id: 102, toiletId: 'T-05', location: 'Block A - 2nd Floor', staff: 'John ', time: '---', status: 'Pending' }, // Changed to Pending
    { id: 103, toiletId: 'T-02', location: 'Cafeteria South', staff: 'John', time: '2026-03-01 12:45 PM', status: 'Completed' },
    { id: 104, toiletId: 'T-09', location: 'Library West', staff: 'John ', time: '2026-03-01 02:20 PM', status: 'Completed' },
  ]);

  return (
    <div className="logs-container">
      <div className="logs-header">
        <h2>Cleaning Maintenance Logs</h2>
        <button className="export-btn">Download Report (CSV)</button>
      </div>

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
                  {/* 2. Dynamic class based on status */}
                  <span className={`status-pill ${log.status === 'Completed' ? 'status-completed' : 'status-pending'}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CleaningLogs;