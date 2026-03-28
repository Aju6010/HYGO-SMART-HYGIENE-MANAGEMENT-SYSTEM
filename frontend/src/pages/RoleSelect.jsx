import { useNavigate } from "react-router-dom";
import "../styles/roleselect.css";


import hygoLogo from "../img_vid/hygo_logo_temp.png";
import adminIcon from "../img_vid/admin_hygo1.png";
import staffIcon from "../img_vid/mop_hygo1.png";

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="role-page">
      <div className="role-container">

        {/* HYGO LOGO */}
        <div className="logo-top">
          <img src={hygoLogo} alt="HYGO Logo" />
        </div>

        {/* TITLE */}
        <h2 className="main-title">
          SMART <span>HYGIENE</span>,<br />
          BETTER <span>LIVING</span>
        </h2>

        <p className="subtitle">
          Select your role to continue to the dashboard
        </p>

        {/* ROLE CARDS */}
        <div className="card-grid">

          {/* ADMIN */}
          <div
            className="role-card"
            onClick={() => navigate("/login?role=admin")}
          >
            <img src={adminIcon} alt="Admin" className="role-icon" />
            <div className="role-label">ADMIN</div>
          </div>

          {/* STAFF */}
          <div
            className="role-card"
            onClick={() => navigate("/login?role=staff")}
          >
            <img src={staffIcon} alt="Staff" className="role-icon" />
            <div className="role-label">STAFF</div>
          </div>

        </div>
      </div>
    </div>
  );
}
