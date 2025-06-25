import "./App.css";
import { useState, useEffect } from "react";
import Chat from "./components/Chat";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                toastClassName="toastify-font"
            />
            {user ? (
                <Chat user={user} onLogout={handleLogout} />
            ) : (
                <Login onLogin={handleLogin} />
            )}
        </div>
    );
}

export default App;
