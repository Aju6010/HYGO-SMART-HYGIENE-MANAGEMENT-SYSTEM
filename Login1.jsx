import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/log.css";
import mopLogo from "../img_vid/mop_hygo1.png";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // read role from URL (?role=admin or ?role=staff)
  const role = searchParams.get("role"); // "admin" | "staff"

  const handleLogin = async (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const pass = e.target.password.value;

  if (!role) {
    alert("Please select a role (Admin or Staff) first.");
    navigate("/roles");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: email,
        password: pass
      })
    });

    if (!res.ok) {
      throw new Error("Login failed");
    }

    const data = await res.json();

    if (data.role !== role) {
      alert("Role mismatch. Please select correct role.");
      return;
    }

    navigate("/dashboard");

  } catch (err) {
    alert("Invalid username or password");
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
            type="text"
            name="email"
            placeholder="Username"
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
