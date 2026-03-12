import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/log.css";

import mopLogo from "../img_vid/mop_hygo1.png";


export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // read role from URL (?role=admin or ?role=staff)
  const role = searchParams.get("role"); // "admin" | "staff"

  const handleLogin = (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const pass = e.target.password.value;

  // 1. Validation for Role
  if (!role) {
    alert("Please select a role (Admin or Staff) first.");
    navigate("/roles");
    return;
  }

  // 2. Validation for Password Length
  if (pass.length !== 8) {
    alert("Password must be exactly 8 characters long.");
    return;
  }

  // 3. Successful Navigation
  if (role === "admin") {
    navigate("/dashboard"); // Matches <Route path="/dashboard" />
  } else if (role === "staff") {
    navigate("/StaffDashboard"); // Matches <Route path="/StaffDashboard" />
  }
};

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-container">
          <img src={mopLogo} alt="Company Logo" className="app-logo" />
          
        </div>

        {/* ROLE TITLE */}
        <h1>{role === "admin" ? "Admin Login" : "Staff Login"}</h1>

        <p className="subtitle">
          Please enter your details to sign in
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            minLength="8"
            maxLength="8"
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

        {/* CHANGE ROLE */}
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
