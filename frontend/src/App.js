import "./App.css";
import { useState, useEffect } from "react";
import Chat from "./components/Chat";
import Login from "./components/Login";

function App() {
    const [user, setUser] = useState(null); // user info like id or username

    // Check if already logged in from localStorage (token stored)
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId"); // optional
        if (token && userId) {
            setUser({ id: userId });
        }
    }, []);

    const handleLogin = (userInfo) => {
        setUser(userInfo);
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.clear();
    };

    return (
        <div className="App-header">
            {user ? (
                <Chat user={user} onLogout={handleLogout} />
            ) : (
                <Login onLogin={handleLogin} />
            )}
        </div>
    );
}

export default App;
