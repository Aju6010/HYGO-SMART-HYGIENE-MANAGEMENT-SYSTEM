import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/logo.css";

export default function Intro() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/login");
    }, 3000);
  }, []);

  return (
    <div className="intro">
      <h1>
        <span>H</span>
        <span>Y</span>
        <span>G</span>
        <span>O</span>
      </h1>
      <p className="tagline">Smart Hygiene Management System</p>
    </div>
  );
}
