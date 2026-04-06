import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

import ProfileView from './ProfileView';
import CleaningLogs from './CleaningLogs';
import AssignedTasks from './AssignedTasks';
import Complaints from './Complaints';

import "../styles/Combined.css";
import "../styles/dash.css";

const StaffDashboard = () => {

  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const [trustScore, setTrustScore] = useState(0);
  const [staffname, setStaffName] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [toilets, setToilets] = useState([]);

  const radius = 60;
  const circumference = Math.PI * radius;
  const dashOffset = circumference - (trustScore / 100) * circumference;

  const handleLogout = () => {

    const confirmLogout = window.confirm("Are you sure you want to logout?");

    if (confirmLogout) {

      localStorage.removeItem("staff_id");

      navigate('/login');

    }

  };



  const fetchTrustScore = async () => {
    try {
      const staffId = localStorage.getItem("staff_id");
      const res = await fetch(`${API_BASE_URL}/api/report/summary?staff_id=${staffId}`);
      if (!res.ok) {
        throw new Error("API error");
      }
      const data = await res.json();
      let score = 0;
      if (data.verification_rate) {
        score = parseInt(data.verification_rate);
      }
      setTrustScore(score);
    } catch (err) {
      console.log("Trust score error:", err);
    }
  };


  const fetchData = () => {
    // Alerts
    fetch(`${API_BASE_URL}/api/cleaning-alerts`)
      .then(res => res.json())
      .then(data => setAlerts(data));

    // Toilets
    fetch(`${API_BASE_URL}/api/toilets`)
      .then(res => res.json())
      .then(data => setToilets(data));

    fetchTrustScore();

    const staffId = localStorage.getItem("staff_id");

    fetch(`${API_BASE_URL}/api/staff/profile/${staffId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.name) {
          setStaffName(data.name);
        }
      })
      .catch(err => {
        console.log("Profile fetch error:", err);
      });
  };


  useEffect(() => {

    fetchData();

  }, []);

  // ===== KPI CALCULATIONS (Matches Admin Dashboard) =====
  const total = toilets.length;
  // Dirty = Sensor alerts (High Odour / Urgent)
  const dirty = alerts.filter(a => a.type === "HIGH_ODOUR" || a.type === "URGENT_CLEANING").length;
  // Needs Attention = Maintenance alerts (Not Cleaned / High Usage)
  const needsAttention = alerts.filter(a => a.type === "NOT_CLEANED" || a.type === "HIGH_USAGE" || a.type === "MODERATE_ODOUR").length;
  // Clean = Everything else
  const clean = total - (dirty + needsAttention);



  return (

    <div className="hygo-dashboard-container">

      <aside className="hygo-sidebar">

        <div className="sidebar-brand">HYGO</div>

        <nav className="sidebar-nav">

          <ul>

            <li
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </li>

            <li
              className={activeTab === 'assigned-tasks' ? 'active' : ''}
              onClick={() => setActiveTab('assigned-tasks')}
            >
              Assigned Tasks
            </li>

            <li
              className={activeTab === 'cleaning-logs' ? 'active' : ''}
              onClick={() => setActiveTab('cleaning-logs')}
            >
              Cleaning Logs
            </li>

            <li
              className={activeTab === 'complaints' ? 'active' : ''}
              onClick={() => setActiveTab('complaints')}
            >
              Complaints
            </li>

            <li
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              My Profile
            </li>

          </ul>

        </nav>

      </aside>



      <main className="hygo-main-content">

        <header className="main-header">

          <h1>

            {activeTab === 'profile' ? 'User Profile' :
              activeTab === 'cleaning-logs' ? 'Cleaning Maintenance Logs' :
                activeTab === 'assigned-tasks' ? 'Tasks from Authority' :
                  activeTab === 'complaints' ? 'File a Complaint' :
                    'Staff Overview'}

          </h1>


          <div className="header-actions">

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              <span className="logout-icon">⎋</span> Logout
            </button>

          </div>

        </header>



        <div className="content-body">

          {activeTab === 'profile' ? (

            <ProfileView />

          ) : activeTab === 'cleaning-logs' ? (

            <CleaningLogs />

          ) : activeTab === 'assigned-tasks' ? (

            <AssignedTasks />

          ) : activeTab === 'complaints' ? (

            <Complaints />

          ) : (

            <div className="dashboard-stats-container">


              <div className="dashboard-welcome-banner">

                <div className="welcome-info">

                  <h2>Good Day, {staffname || 'Staff'}!</h2>

                  <p>
                    Your hygiene management performance is currently
                    <strong> Excellent</strong>.
                  </p>

                </div>


                <div className="trust-gauge-container">

                  <svg width="200" height="120" viewBox="0 0 160 100">

                    <defs>

                      <linearGradient
                        id="gaugeGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >

                        <stop offset="0%" stopColor="#ff4d4d" />
                        <stop offset="50%" stopColor="#f9d423" />
                        <stop offset="100%" stopColor="#2ecc71" />

                      </linearGradient>

                    </defs>


                    <path
                      d="M20,80 A60,60 0 0,1 140,80"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />


                    <path
                      d="M20,80 A60,60 0 0,1 140,80"
                      fill="none"
                      stroke="url(#gaugeGradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                    />

                  </svg>


                  <div className="gauge-overlay">

                    <span className="gauge-score">
                      {trustScore}%
                    </span>

                    <span className="gauge-text">
                      Performance Index
                    </span>

                  </div>

                </div>

              </div>


              <div className="dashboard-metrics-section">

                {/* KPI CARDS — IDENTICAL TO ADMIN DASHBOARD */}
                <div className="cards" style={{ padding: '0 0 20px 0' }}>

                  <div className="card card-blue">
                    <div className="card-content">
                      <p className="card-title">Total Toilets</p>
                      <h2>{total}</h2>
                      <span className="card-sub">All facilities</span>
                    </div>
                    <div className="card-icon blue">🚿</div>
                  </div>

                  <div className="card card-green">
                    <div className="card-content">
                      <p className="card-title">Clean Toilets</p>
                      <h2>{clean}</h2>
                      <span className="card-sub up">+5% today</span>
                    </div>
                    <div className="card-icon green">✨</div>
                  </div>

                  <div className="card card-red">
                    <div className="card-content">
                      <p className="card-title">Dirty Toilets</p>
                      <h2>{dirty}</h2>
                      <span className="card-sub danger">Action required</span>
                    </div>
                    <div className="card-icon red">💧</div>
                  </div>

                  <div className="card card-yellow">
                    <div className="card-content">
                      <p className="card-title">Needs Attention</p>
                      <h2>{needsAttention}</h2>
                      <span className="card-sub">Overdue cleaning</span>
                    </div>
                    <div className="card-icon yellow">⚠️</div>
                  </div>

                </div>

                {/* ALERTS SECTION — IDENTICAL TO ADMIN DASHBOARD */}
                <div className="alerts-section" style={{ margin: '20px 0' }}>
                  <h3 style={{ marginBottom: '15px' }}>Active Alerts</h3>

                  {alerts.length === 0 && (
                    <p style={{ color: "green" }}>
                      No alerts. All toilets are clean ✅
                    </p>
                  )}

                  <div className="alerts-list">
                    {alerts.map((alert, index) => (
                      <div key={index} className="alert-card critical">
                        <div className="alert-left">
                          <strong>Toilet {alert.toilet_id}</strong>
                          <p>{alert.message}</p>
                        </div>

                        <div className="alert-right">
                          <span>{alert.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          )}

        </div>

      </main>

    </div>

  );

};

export default StaffDashboard;