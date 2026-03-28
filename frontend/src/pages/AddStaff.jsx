import { useState } from "react";

function AddStaff() {
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await fetch(
        "https://hygo-smart-hygiene-management-system.onrender.com/api/staff",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            status: "Active",
            score: 0,
          }),
        }
      );

      const data = await res.json();
      alert("Staff Added ✅");
      console.log(data);

    } catch (err) {
      console.log(err);
      alert("Error adding staff ❌");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Add Staff Member</h2>

      <input
        type="text"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSubmit}>
        Add Staff
      </button>
    </div>
  );
}

export default AddStaff;