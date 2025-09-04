// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(formData);
      navigate("/"); // redirect to home after login
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        if (typeof errors === "object" && !errors.detail) {
          setError(Object.values(errors).flat().join(" "));
        } else {
          setError(errors.detail || "Login failed. Try again.");
        }
      } else setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center" }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
        <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#333", color: "#fff", border: "none", cursor: "pointer" }}>
          Login
        </button>
      </form>
      <div style={{ marginTop: "15px", textAlign: "center" }}>
        <Link to="/forgot-password" style={{ marginRight: "10px" }}>Forgot password?</Link>
        <Link to="/register">Register</Link>
      </div>
    </div>
  );
};

export default Login;
