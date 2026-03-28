import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Intro from "./pages/Intro";
import RoleSelect from "./pages/roleselect";
import Login from "./pages/Login1";
import StaffManagement from "./pages/StaffManagement";
import ToiletStatus from "./pages/ToiletStatus";
import AlertsFeedback from "./pages/AlertsFeedback";
import Reports from "./pages/Reports";
import StaffDashboard from "./pages/StaffDashboard";

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/roles" element={<RoleSelect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/toilet" element={<ToiletStatus />} />
        <Route path="/alerts" element={<AlertsFeedback />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
      </Routes>
    
  );
}



export default App;
