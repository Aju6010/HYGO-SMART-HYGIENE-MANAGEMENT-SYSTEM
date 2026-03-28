import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/log.css";
import mopLogo from "../img_vid/mop_hygo1.png";

export default function Login() {

const navigate = useNavigate();
const [searchParams] = useSearchParams();

const role = searchParams.get("role");

const handleLogin = async (e) => {

e.preventDefault();

const username = e.target.email.value;
const password = e.target.password.value;

try {

  const res = await fetch("https://hygo-smart-hygiene-management-system.onrender.com/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  });
  console.log("updated");

  const data = await res.json();

  if (!data.success) {
    alert("Invalid username or password");
    return;
  }

  // ADMIN LOGIN
  if (data.role === "admin") {
    navigate("/dashboard");
  }

  // STAFF LOGIN
  if (data.role === "staff") {

    localStorage.setItem("staff_id", data.staff_id);

    navigate("/staff-dashboard");
  }

} catch (err) {

  console.log(err);
  alert("Login failed");

}

};

return (

<div className="login-page">

  <div className="login-card">

    <div className="logo-container">
      <img src={mopLogo} alt="Company Logo" className="app-logo" />
    </div>

    <h1>{role === "admin" ? "Admin Login" : "Staff Login"}</h1>

    <p className="subtitle">
      Please enter your details to sign in
    </p>

    <form onSubmit={handleLogin}>

      <input
        type="text"
        name="email"
        placeholder="Username"
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        required
      />

      <div className="options">

        <button
          type="button"
          className="link-btn"
          onClick={() => alert("Forgot password coming soon")}
        >
          Forgot password?
        </button>

      </div>

      <button type="submit" className="btn">
        Sign in
      </button>

    </form>

    <div className="options">

      <button
        type="button"
        className="link-btn"
        onClick={() => navigate("/roles")}
      >
        ← Change Role
      </button>

    </div>

  </div>

</div>

);

}