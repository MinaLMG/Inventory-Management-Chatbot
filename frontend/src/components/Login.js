import React, { useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import classes from "./Login.module.css";

Modal.setAppElement("#root"); // for accessibility

const AuthForm = ({ onLogin }) => {
    const [mode, setMode] = useState("login"); // "login" or "register"
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "", // used in register only
    });
    const [error, setError] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);

    const handleChange = (e) => {
        setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleToggleMode = () => {
        setMode((m) => (m === "login" ? "register" : "login"));
        setFormData({ username: "", password: "", confirmPassword: "" });
        setError("");
    };

    const showModal = (message) => {
        setError(message);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, password, confirmPassword } = formData;

        if (mode === "register" && password !== confirmPassword) {
            return showModal("Passwords do not match.");
        }

        try {
            const endpoint =
                mode === "login"
                    ? process.env.REACT_APP_BACKEND + "users/login"
                    : process.env.REACT_APP_BACKEND + "users/register";

            const body =
                mode === "login"
                    ? { username, password }
                    : { username, password };
            const res = await axios.post(endpoint, body);
            if (mode === "login") {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("userId", res.data.userId);
                onLogin({ id: res.data.userId });
            } else {
                alert("Registered successfully!");
                setMode("login");
            }

            setFormData({ username: "", password: "", confirmPassword: "" });
        } catch (err) {
            const msg =
                err.response?.data?.error ||
                "Something went wrong. Please try again.";
            showModal(msg);
        }
    };

    return (
        <div className={classes["auth-form-container"]}>
            <h2>{mode === "login" ? "Login" : "Register"}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                {mode === "register" && (
                    <input
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                )}

                <button type="submit">
                    {mode === "login" ? "Login" : "Register"}
                </button>
            </form>

            <p style={{ marginTop: "1rem" }}>
                {mode === "login"
                    ? "Don't have an account?"
                    : "Already registered?"}{" "}
                <button
                    onClick={handleToggleMode}
                    style={{
                        textDecoration: "underline",
                        background: "none",
                        border: "none",
                        color: "blue",
                        cursor: "pointer",
                    }}
                >
                    {mode === "login" ? "Register here" : "Login here"}
                </button>
            </p>

            {/* Modal for error messages */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleCloseModal}
                contentLabel="Error"
                style={{
                    content: {
                        maxHeight: "50%",
                        maxWidth: "400px",
                        margin: "auto",
                        padding: "1.5rem",
                        borderRadius: "10px",
                    },
                }}
            >
                <h3>Error</h3>
                <p>{error}</p>
                <button onClick={handleCloseModal}>Close</button>
            </Modal>
        </div>
    );
};

export default AuthForm;
