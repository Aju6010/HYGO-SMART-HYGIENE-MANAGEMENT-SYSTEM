import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddStaff() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [status, setStatus] = useState("on");
  const [score, setScore] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, status, score }),
      });

      const data = await res.json();
      console.log(data);

      alert("Staff Added ✅");

      navigate("/staff"); // go back to staff page
    } catch (err) {
      console.error(err);
      alert("Error adding staff");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Add Staff</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label><br />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Status:</label><br />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="on">On Duty</option>
            <option value="off">Off Duty</option>
          </select>
        </div>

        <div>
          <label>Score:</label><br />
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
        </div>

        <br />
        <button type="submit">Add Staff</button>
      </form>
    </div>
  );
}