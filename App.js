import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Intro from "./pages/Intro";
import RoleSelect from "./pages/RoleSelect";
import Login from "./pages/Login1";
import StaffManagement from "./pages/StaffManagement";
import ToiletStatus from "./pages/ToiletStatus";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/roles" element={<RoleSelect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/toilet" element={<ToiletStatus />} />
      </Routes>
    </Router>
  );
}



export default App;
