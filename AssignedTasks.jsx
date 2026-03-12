import React, { useState } from 'react';
import "../styles/AssignedTasks.css";

const AssignedTasks = () => {
  // Mock data for tasks assigned by authority
  const [tasks] = useState([
    { 
      id: "TASK-501", 
      location: "Admin Block - Level 1", 
      assignedTime: "2026-03-01 09:00 AM", 
      deadline: "11:00 AM", 
      authority: "Municipality",
      priority: "High" 
    },
    { 
      id: "TASK-502", 
      location: "Main Auditorium Restroom", 
      assignedTime: "2026-03-01 10:30 AM", 
      deadline: "12:30 PM", 
      authority: "Municipality",
      priority: "Medium" 
    },
    { 
      id: "TASK-503", 
      location: "Hostel C - Ground Floor", 
      assignedTime: "2026-03-01 11:00 AM", 
      deadline: "01:00 PM", 
      authority: "Municipality",
      priority: "Emergency" 
    }
  ]);

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h2>Assigned Tasks (From Authority)</h2>
        <span className="task-count">{tasks.length} New Tasks</span>
      </div>

      <div className="task-card-grid">
        {tasks.map((task) => (
          <div key={task.id} className={`task-card ${task.priority.toLowerCase()}`}>
            <div className="task-card-header">
              <span className="task-id">{task.id}</span>
              <span className="priority-tag">{task.priority}</span>
            </div>
            
            <div className="task-details">
              <div className="detail-item">
                <label>Location:</label>
                <span>{task.location}</span>
              </div>
              <div className="detail-item">
                <label>Assigned At:</label>
                <span>{task.assignedTime}</span>
              </div>
              <div className="detail-item">
                <label>Deadline:</label>
                <span className="deadline-text">{task.deadline}</span>
              </div>
              <div className="detail-item">
                <label>By Authority:</label>
                <span>{task.authority}</span>
              </div>
            </div>
            {/* Start Task Button has been removed */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignedTasks;