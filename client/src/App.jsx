import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Toaster } from "react-hot-toast";
import { Moon, Sun } from "lucide-react";
import JoinForm from "./components/JoinForm";
import ChatRoom from "./components/ChatRoom";

const socket = io(
  import.meta.env.MODE === "development" ? "http://localhost:5000/" : "/"
);

export default function App() {
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState(null);
  const [username, setUsername] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-vercel-black transition-colors duration-300">
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-vercel-light-gray dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="flex flex-col min-h-screen">
        {!joined ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <JoinForm
              socket={socket}
              setJoined={setJoined}
              setRoom={setRoom}
              setUsername={setUsername}
            />
          </div>
        ) : (
          <ChatRoom socket={socket} room={room} username={username} />
        )}
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: darkMode ? "#1f2937" : "#fff",
            color: darkMode ? "#fff" : "#000",
            border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
          },
        }}
      />
    </div>
  );
}
