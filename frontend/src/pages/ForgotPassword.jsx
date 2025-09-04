import React, { useState } from "react";
import { MDBBtn, MDBContainer, MDBCard, MDBCardBody, MDBInput } from "mdb-react-ui-kit";
import { forgotPassword } from "../api/authApi";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(""); // success message
    const [error, setError] = useState("");     // error message

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            const res = await forgotPassword(email);
            setMessage(res.data?.message || "Check your email for reset instructions");
        } catch (err) {
            const errors = err.response?.data;
            if (errors) setError(errors.detail || "Failed to send reset email");
            else setError("Something went wrong");
        }
    };

    return (
        <MDBContainer className="my-5">
            <MDBCard className="p-4">
                <MDBCardBody>
                    <h3 className="fw-bold mb-4">Forgot Password</h3>
                    <form onSubmit={handleSubmit}>
                        <MDBInput
                            wrapperClass="mb-4"
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        {error && <p style={{ color: "red" }}>{error}</p>}
                        {message && <p style={{ color: "green" }}>{message}</p>}
                        <MDBBtn color="dark" type="submit">
                            Send Reset Link
                        </MDBBtn>
                    </form>
                </MDBCardBody>
            </MDBCard>
        </MDBContainer>
    );
};

export default ForgotPassword;
