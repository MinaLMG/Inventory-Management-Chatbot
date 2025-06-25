import React, { useState } from "react";
import axios from "axios";
import classes from "./Login.module.css";
import InputField from "./general/InputField";
import { toast } from "react-toastify";
const AuthForm = (props) => {
    const [mode, setMode] = useState("login"); // "login" or "register"
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "", // used in register only
    });
    const handleChange = (e) => {
        setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleToggleMode = () => {
        setMode((m) => (m === "login" ? "register" : "login"));
        setFormData({ username: "", password: "", confirmPassword: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, password, confirmPassword } = formData;

        if (mode === "register" && password !== confirmPassword) {
            return toast.error("Passwords do not match.");
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
                props.onLogin({ id: res.data.userId, name: res.data.username });
            } else {
                toast.success("successfully registered.");
                setMode("login");
            }

            setFormData({ username: "", password: "", confirmPassword: "" });
        } catch (err) {
            const msg =
                err.response?.data?.error ||
                "Something went wrong. Please try again.";
            return toast.error(msg);
        }
    };

    return (
        <div className={classes["container"]}>
            <div className={classes["wrapper"]}>
                <form action="" onSubmit={handleSubmit}>
                    <h1>{mode === "login" ? "Login" : "Register"}</h1>
                    <InputField
                        type="text"
                        name="username"
                        id="username"
                        placeholder="UserName"
                        onChange={handleChange}
                        value={formData.username}
                        required={true}
                        icon="FaUser"
                    ></InputField>
                    <InputField
                        type="password"
                        name="password"
                        id="password"
                        placeholder="pasword"
                        onChange={handleChange}
                        value={formData.password}
                        required={true}
                        icon="FaLock"
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
                            icon="FaLock"
                        ></InputField>
                    )}
                    <button type="submit">
                        {mode === "login" ? "Login" : "Register"}
                    </button>
                    <div className={classes["register-link"]}>
                        <p>
                            {mode === "login"
                                ? "Don't have an account?"
                                : "Already registered?"}{" "}
                            <a onClick={handleToggleMode}>
                                {mode === "login"
                                    ? "Register here"
                                    : "Login here"}
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthForm;
