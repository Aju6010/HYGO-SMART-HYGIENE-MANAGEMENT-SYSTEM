import React, { useState, useEffect } from 'react';
import "../styles/Complaints.css";

const Complaints = () => {

  const [complaint, setComplaint] = useState("");
  const [category, setCategory] = useState("Hygiene Issue");
  const [submitted, setSubmitted] = useState(false);

  const [recentComplaints, setRecentComplaints] = useState([]);

  const fetchComplaints = () => {

    fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/complaints")
      .then(res => res.json())
      .then(data => {
        setRecentComplaints(data);
      })
      .catch(err => {
        console.log("Error fetching complaints:", err);
      });

  };

  useEffect(() => {

    fetchComplaints();

    const interval = setInterval(fetchComplaints, 10000);

    return () => clearInterval(interval);

  }, []);



  const handleSubmit = (e) => {

    e.preventDefault();

    if (complaint.trim().length < 10) {

      alert("Please provide more details (at least 10 characters).");
      return;

    }

    const staffId = localStorage.getItem("staff_id");
    fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/complaints", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        category: category,
        description: complaint,
        staff_id: staffId
      })

    })
      .then(res => res.json())
      .then(data => {

        setSubmitted(true);
        setComplaint("");

        fetchComplaints();

      })
      .catch(err => {

        console.log("Submit error:", err);

      });

  };


  return (

    <div className="complaints-container">

      <div className="complaints-card">

        <h2>Report a Complaint</h2>

        <p>
          Your feedback helps us maintain the HYGO standards.
          Please describe the issue clearly.
        </p>


        {submitted ? (

          <div className="success-banner">

            <h3>Complaint Submitted Successfully!</h3>

            <p>
              The authority has been notified. We will look into it shortly.
            </p>

            <button onClick={() => setSubmitted(false)}>
              File Another Complaint
            </button>

          </div>

        ) : (

          <form onSubmit={handleSubmit} className="complaints-form">


            <div className="form-group">

              <label>Issue Category</label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >

                <option value="Hygiene Issue">Hygiene Issue</option>
                <option value="Technical Malfunction">Technical Malfunction (Sensor/IoT)</option>
                <option value="Plumbing/Water Issue">Plumbing/Water Issue</option>
                <option value="Supply Shortage">Supply Shortage (Soap/Paper)</option>
                <option value="Other">Other</option>

              </select>

            </div>


            <div className="form-group">

              <label>Detailed Description</label>

              <textarea
                rows="6"
                placeholder="Describe the issue, including the specific location or toilet ID..."
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
              ></textarea>

              <small className="char-count">
                {complaint.length} characters
              </small>

            </div>


            <button type="submit" className="submit-complaint-btn">

              Submit Complaint

            </button>

          </form>

        )}

      </div>


      <div className="recent-complaints">

        <h3>Recent Complaints</h3>

        {recentComplaints.length === 0 && (

          <p>No complaints yet.</p>

        )}


        {recentComplaints.map((c) => (

          <div key={c.complaint_id} className="complaint-item">

            <strong>{c.category}</strong>

            <p>{c.description}</p>

            <span className="complaint-time">
              {c.time}
            </span>

          </div>

        ))}

      </div>

    </div>

  );

};

export default Complaints;