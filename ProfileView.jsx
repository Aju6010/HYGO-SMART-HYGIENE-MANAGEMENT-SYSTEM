import React from 'react';
import "../styles/Combined.css";
import userImg from '../img_vid/user_photo.jpg'; // Placeholder 

const ProfileView = () => {
  return (
    <div className="profile-wrapper">
      <div className="profile-banner-top">
        <span>Profile View (HYGO HYGIENE MANAGEMENT SYSTEM)</span>
      
      </div>

      <div className="profile-card">
        {/* Centered User Identity Section */}
        <div className="user-identity-centered">
          <div className="image-circle">
            <img src={userImg} alt="John" />
          </div>
          <div className="user-label-blue">JOHN</div>
        </div>

        {/* Basic Details Section */}
        <div className="details-accordion">
          <div className="details-title">
            <span>▼ Basic details</span>
          </div>
          
          <div className="details-grid">
            <div className="details-col">
              <div className="data-row"><span className="label">Gender</span> <strong>Male</strong></div>
              <div className="data-row"><span className="label">Date of Birth</span> <strong>16/03/2005</strong></div>
              <div className="data-row"><span className="label">Aadhar Number</span> <strong>XXXX XXXX 0917</strong></div>
              <div className="data-row"><span className="label">Mother Tongue</span> <strong>MALAYALAM</strong></div>
              <div className="data-row"><span className="label">Category</span> <strong>General</strong></div>
            </div>
            <div className="details-col">
              <div className="data-row"><span className="label">Address</span> <strong>Muvattupuzha</strong></div>
              <div className="data-row"><span className="label">Native</span> <strong>Ernakulam</strong></div>
              <div className="data-row"><span className="label">Nationality</span> <strong>INDIAN</strong></div>
              <div className="data-row"><span className="label">Blood Group</span> <strong>O+ve</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;