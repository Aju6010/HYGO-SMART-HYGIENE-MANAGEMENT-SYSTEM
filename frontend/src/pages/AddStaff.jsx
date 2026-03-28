import { useState } from "react";

function AddStaff() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = () => {
    fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/add-staff", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, role })
    })
    .then(res => res.json())
    .then(() => {
      alert("✅ Staff added!");
      setName("");
      setRole("");
    })
    .catch(err => console.log(err));
  };

  return (
    <div>
      <h2>Add Staff</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />

      <button onClick={handleSubmit}>Save</button>
    </div>
  );
}

export default AddStaff;