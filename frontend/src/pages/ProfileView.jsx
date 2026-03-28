import React, { useEffect, useState } from 'react';
import "../styles/Combined.css";
import userImg from '../img_vid/user_photo.jpg';

const ProfileView = () => {

  const [profile,setProfile] = useState(null);

  useEffect(()=>{

    const staffId = localStorage.getItem("staff_id");

fetch(`https://hygo-smart-hygiene-management-system.onrender.com/api/staff/profile/${staffId}`)
    .then(res=>res.json())
    .then(data=>{
      setProfile(data);
    })
    .catch(err=>{
      console.log("Profile error:",err);
    });

  },[]);


  if(!profile){
    return <p style={{padding:"20px"}}>Loading profile...</p>;
  }


  return (

    <div className="profile-wrapper">

      <div className="profile-banner-top">
        <span>Profile View (HYGO HYGIENE MANAGEMENT SYSTEM)</span>
      </div>

      <div className="profile-card">

        <div className="user-identity-centered">

          <div className="image-circle">
            <img src={userImg} alt={profile.name}/>
          </div>

          <div className="user-label-blue">
            {profile.name}
          </div>

        </div>


        <div className="details-accordion">

          <div className="details-title">
            <span>▼ Basic details</span>
          </div>

          <div className="details-grid">

            <div className="details-col">

              <div className="data-row">
                <span className="label">Gender</span>
                <strong>{profile.gender}</strong>
              </div>

              <div className="data-row">
                <span className="label">Date of Birth</span>
                <strong>{profile.dob}</strong>
              </div>

              <div className="data-row">
                <span className="label">Aadhar Number</span>
                <strong>{profile.aadhar}</strong>
              </div>

              <div className="data-row">
                <span className="label">Mother Tongue</span>
                <strong>{profile.mother_tongue}</strong>
              </div>

              <div className="data-row">
                <span className="label">Category</span>
                <strong>{profile.category}</strong>
              </div>

            </div>


            <div className="details-col">

              <div className="data-row">
                <span className="label">Address</span>
                <strong>{profile.address}</strong>
              </div>

              <div className="data-row">
                <span className="label">Native</span>
                <strong>{profile.native_place}</strong>
              </div>

              <div className="data-row">
                <span className="label">Nationality</span>
                <strong>{profile.nationality}</strong>
              </div>

              <div className="data-row">
                <span className="label">Blood Group</span>
                <strong>{profile.blood_group}</strong>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

};

export default ProfileView;