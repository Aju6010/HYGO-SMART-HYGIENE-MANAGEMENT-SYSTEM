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

      <NavLink to="/toilet" className="nav-btn">
  Toilet Status
</NavLink>


      <NavLink to="#" className="nav-btn">
        Alerts & Feedback
      </NavLink>

      <NavLink to="#" className="nav-btn">
        Reports
      </NavLink>
    </div>
  );
}
