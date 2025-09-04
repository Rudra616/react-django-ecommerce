// src/pages/Register.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { MDBBtn, MDBContainer, MDBCard, MDBCardBody, MDBRow, MDBCol, MDBInput } from "mdb-react-ui-kit";

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await register(formData);
      navigate("/login");
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        if (typeof errors === "object" && !errors.detail) {
          setError(Object.values(errors).flat().join(" "));
        } else {
          setError(errors.detail || "Registration failed. Try again.");
        }
      } else setError("Something went wrong. Please try again.");
    }
  };

  return (
    <MDBContainer className="my-5">
      <MDBCard className="p-4">
        <MDBCardBody>
          <h3 className="fw-bold mb-4">Create Account</h3>
          <form onSubmit={handleSubmit}>
            <MDBInput
              wrapperClass="mb-4"
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <MDBInput
              wrapperClass="mb-4"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <MDBInput
              wrapperClass="mb-4"
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <MDBBtn color="dark" type="submit">
              Register
            </MDBBtn>
          </form>
          <p className="mt-3">
            Already have an account? <a href="/login">Login here</a>
          </p>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default Register;
