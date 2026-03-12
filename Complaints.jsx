import React, { useState } from 'react';
import "../styles/Complaints.css";

const Complaints = () => {
  const [complaint, setComplaint] = useState("");
  const [category, setCategory] = useState("Hygiene Issue");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (complaint.trim().length < 10) {
      alert("Please provide more details (at least 10 characters).");
      return;
    }
    // Logic to send data to the backend would go here
    console.log("Complaint Submitted:", { category, complaint });
    setSubmitted(true);
    setComplaint("");
  };

  return (
    <div className="complaints-container">
      <div className="complaints-card">
        <h2>Report a Complaint</h2>
        <p>Your feedback helps us maintain the HYGO standards. Please describe the issue clearly.</p>

        {submitted ? (
          <div className="success-banner">
            <h3>Complaint Submitted Successfully!</h3>
            <p>The authority has been notified. We will look into it shortly.</p>
            <button onClick={() => setSubmitted(false)}>File Another Complaint</button>
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
              <small className="char-count">{complaint.length} characters</small>
            </div>

            <button type="submit" className="submit-complaint-btn">
              Submit Complaint
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Complaints;