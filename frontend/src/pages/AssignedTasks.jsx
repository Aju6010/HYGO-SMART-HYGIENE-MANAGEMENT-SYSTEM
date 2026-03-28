import React, { useState, useEffect } from 'react';
import "../styles/AssignedTasks.css";

const AssignedTasks = () => {

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const staffId = localStorage.getItem("staff_id");

fetch(`https://hygo-smart-hygiene-management-system.onrender.com/api/staff/assigned-tasks/${staffId}`)

      .then((res) => {

        if (!res.ok) {
          throw new Error("Server error");
        }

        return res.json();

      })

      .then((data) => {

        setTasks(data);
        setLoading(false);

      })

      .catch((err) => {

        console.log("Error fetching tasks:", err);
        setTasks([]);
        setLoading(false);

      });

  }, []);

  return (
    <div className="tasks-container">

      <div className="tasks-header">
        <h2>Assigned Tasks (From Authority)</h2>
        <span className="task-count">
          {tasks.length} New Tasks
        </span>
      </div>

      {loading && (
        <p style={{padding:"20px"}}>Loading tasks...</p>
      )}

      {!loading && tasks.length === 0 && (
        <p style={{padding:"20px"}}>No assigned tasks.</p>
      )}

      <div className="task-card-grid">

        {tasks.map((task) => (

          <div
            key={task.id}
            className={`task-card ${task.priority?.toLowerCase()}`}
          >

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

          </div>

        ))}

      </div>

    </div>
  );
};

export default AssignedTasks;