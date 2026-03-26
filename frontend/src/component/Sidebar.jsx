import { NavLink } from "react-router-dom";

export default function Sidebar() {
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
    </div>
  );
}