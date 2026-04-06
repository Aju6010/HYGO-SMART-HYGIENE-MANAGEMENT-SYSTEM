import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate("/login");
    }
  };
  return (
    <div className="side">
      <div className="side_header">
        <h2 className="up">HYGO</h2>
      </div>

      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          isActive ? "nav-btn active" : "nav-btn"
        }
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/staff"
        className={({ isActive }) =>
          isActive ? "nav-btn active" : "nav-btn"
        }
      >
        Staff Management
      </NavLink>

      <NavLink
        to="/toilet"
        className={({ isActive }) =>
          isActive ? "nav-btn active" : "nav-btn"
        }
      >
        Toilet Status
      </NavLink>

      <NavLink
        to="/alerts"
        className={({ isActive }) =>
          isActive ? "nav-btn active" : "nav-btn"
        }
      >
        Alerts & Feedback
      </NavLink>

      <NavLink
        to="/reports"
        className={({ isActive }) =>
          isActive ? "nav-btn active" : "nav-btn"
        }
      >
        Reports
      </NavLink>

      <button
        onClick={handleLogout}
        className="nav-btn"
        style={{
          width: "100%",
          textAlign: "left",
          border: "none",
          background: "none",
          cursor: "pointer",
          color: "#ef4444",
          fontWeight: "bold",
          marginTop: "20px",
          padding: "10px 16px"
        }}
      >
        Logout ⎋
      </button>
    </div>
  );
}