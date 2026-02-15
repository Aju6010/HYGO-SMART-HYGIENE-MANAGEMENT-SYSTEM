import { useNavigate } from "react-router-dom";
import "../styles/backv.css";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <h2>HYGO Login</h2>
      <input type="text" placeholder="Username" />
      <input type="password" placeholder="Password" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
