import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddStaff() {      
} 

  const [name, setName] = useState("");
  const [status, setStatus] = useState("on");
  const [score, setScore] = useState(80);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/staff", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, status, score }),
    })
      .then(res => res.json())
      .then(() => navigate("/staff"));
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Add Staff</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <br /><br />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="on">On Duty</option>
          <option value="off">Off Duty</option>
        </select>

        <br /><br />

        <input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />

        <br /><br />

        <button type="submit">Add</button>
      </form>
    </div>
  );
