// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { getUserDetails, logoutUser } from "../api/authApi";

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserDetails();
        setUser(data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);


  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to Myshop</h1>
      {user ? (
        <div>
          <p>Hello, {user.username}!</p>
        </div>
      ) : (
        <p>Please login to access your account.</p>
      )}
    </div>
  );
};

export default Home;
