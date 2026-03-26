import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/logo.css";

export default function Intro() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/roles");   // 🔹 go to role selection instead of login
    }, 3000);

    // cleanup to avoid React warnings
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="intro-page">
      <div className="intro">
        <h1>
          <span>H</span>
          <span>Y</span>
          <span>G</span>
          <span>O</span>
        </h1>

        <p className="tagline">
          Smart Hygiene Management System
        </p>
      </div>
    </div>
  );
}
