import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Lock, Hash, User, Plus, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function JoinForm({ socket, setJoined, setRoom, setUsername }) {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [type, setType] = useState("public");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createRoom = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    setIsLoading(true);
    socket.emit(
      "create-room",
      { type, username: name.trim() },
      ({ roomId, password }) => {
        setIsLoading(false);
        setRoom({ id: roomId, type, password });
        setUsername(name.trim());
        setJoined(true);
        toast.success(`Room created successfully!${type === "private" ? ` Password: ${password}` : ""}`);
      }
    );
  };

  const joinRoom = async () => {
    if (!name.trim() || !roomId.trim()) {
      toast.error("Please enter your name and room ID");
      return;
    }
    
    setIsLoading(true);
    socket.emit(
      "join-room",
      { roomId: roomId.trim(), username: name.trim(), password },
      ({ error }) => {
        setIsLoading(false);
        if (error) {
          toast.error(error);
          return;
        }
        setRoom({ id: roomId.trim() });
        setUsername(name.trim());
        setJoined(true);
        toast.success("Joined room successfully!");
      }
    );
  };

  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") {
      action();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto px-4"
    >
      <div className="card p-6 md:p-8 space-y-6">
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-vercel-black dark:bg-white rounded-2xl flex items-center justify-center mx-auto"
          >
            <Users className="w-8 h-8 text-white dark:text-vercel-black" />
          </motion.div>
          <h1 className="text-2xl font-bold text-vercel-black dark:text-white">
            Welcome to ChatRoom
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new room or join an existing one
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, createRoom)}
                className="input pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Room Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setType("public")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  type === "public"
                    ? "border-vercel-black dark:border-white bg-vercel-light-gray dark:bg-gray-800"
                    : "border-vercel-border dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                disabled={isLoading}
              >
                <Users className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Public</div>
                <div className="text-xs text-gray-500">Anyone can join</div>
              </button>
              
              <button
                onClick={() => setType("private")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  type === "private"
                    ? "border-vercel-black dark:border-white bg-vercel-light-gray dark:bg-gray-800"
                    : "border-vercel-border dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                disabled={isLoading}
              >
                <Lock className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Private</div>
                <div className="text-xs text-gray-500">Password required</div>
              </button>
            </div>
          </div>

          {type === "private" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter room password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, joinRoom)}
                  className="input pl-10"
                  disabled={isLoading}
                />
              </div>
            </motion.div>
          )}

          <div className="space-y-3">
            <button
              onClick={createRoom}
              disabled={isLoading || !name.trim()}
              className="btn btn-primary w-full h-12 text-base font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create Room</span>
                </div>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-vercel-border dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-vercel-black text-gray-500">or</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room ID
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    placeholder="Enter room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, joinRoom)}
                    className="input pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <button
                onClick={joinRoom}
                disabled={isLoading || !name.trim() || !roomId.trim()}
                className="btn btn-secondary w-full h-12 text-base font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-vercel-black border-t-transparent rounded-full animate-spin" />
                    <span>Joining...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-5 h-5" />
                    <span>Join Room</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
