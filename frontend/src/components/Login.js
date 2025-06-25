import React, { useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import classes from "./Login.module.css";
import InputField from "./general/InputField";

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
                <InputField
                    type="text"
                    name="username"
                    id="username"
                    placeholder="UserName"
                    onChange={handleChange}
                    value={formData.username}
                    required={true}
                ></InputField>
                <InputField
                    type="password"
                    name="password"
                    id="password"
                    placeholder="pasword"
                    onChange={handleChange}
                    value={formData.password}
                    required={true}
                ></InputField>

                {mode === "register" && (
                    <InputField
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        placeholder="confirm your pasword"
                        onChange={handleChange}
                        value={formData.confirmPassword}
                        required={true}
                    ></InputField>
                )}
                <button type="submit" class="btn btn-primary">
                    {mode === "login" ? "Login" : "Register"}
                </button>
            </form>

            <p>
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
