import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Users,
  Hash,
  Copy,
  LogOut,
  MoreVertical,
  Shield,
  UserPlus,
  UserMinus,
} from "lucide-react";
import TypingIndicator from "./TypingIndicator";
import toast from "react-hot-toast";

export default function ChatRoom({ socket, room, username }) {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [text, setText] = useState("");
  const [showUsers, setShowUsers] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const messagesEnd = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    socket.on("chat-message", (data) => {
      setMessages((prev) => [
        ...prev,
        { ...data, id: Date.now() + Math.random() },
      ]);
    });

    socket.on("system-message", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          username: "system",
          message: msg,
          id: Date.now() + Math.random(),
        },
      ]);
    });

    socket.on("room-users", (userList) => {
      setUsers(userList);
      setIsAdmin(userList[0] === username);
    });

    socket.on("typing", (user) => {
      setTypingUsers((prev) => {
        const newUsers = [...new Set([...prev, user])];
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== user));
        }, 3000);
        return newUsers;
      });
    });

    socket.on("kicked", () => {
      toast.error("You were kicked from the room");
      setTimeout(() => window.location.reload(), 2000);
    });

    return () => {
      socket.off();
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [socket, username]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!text.trim()) return;
    socket.emit("chat-message", {
      roomId: room.id,
      username,
      message: text.trim(),
    });
    setText("");
  }, [socket, room.id, username, text]);

  const handleTyping = useCallback(() => {
    socket.emit("typing", { roomId: room.id, username });
  }, [socket, room.id, username]);

  const copyRoomId = useCallback(() => {
    navigator.clipboard.writeText(room.id);
    toast.success("Room ID copied to clipboard!");
  }, [room.id]);

  const kickUser = useCallback(
    (userToKick) => {
      if (isAdmin && userToKick !== username) {
        socket.emit("kick-user", {
          roomId: room.id,
          username: userToKick,
          admin: username,
        });
      }
    },
    [socket, room.id, username, isAdmin]
  );

  const formatTime = useCallback((timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // Memoize filtered typing users to prevent unnecessary re-renders
  const filteredTypingUsers = useMemo(
    () => typingUsers.filter((u) => u !== username),
    [typingUsers, username]
  );

  // Memoize recent messages for better performance
  const recentMessages = useMemo(
    () => messages.slice(-50), // Only show last 50 messages for performance
    [messages]
  );

  return (
    <div className="flex h-screen bg-white dark:bg-vercel-black">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-vercel-border dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-vercel-black dark:bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <Hash className="w-4 h-4 md:w-5 md:h-5 text-white dark:text-vercel-black" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base md:text-lg font-semibold text-vercel-black dark:text-white truncate">
                {room.id}
              </h1>
              <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                <span className="capitalize">{room.type}</span>
                {room.type === "private" && <Shield className="w-3 h-3" />}
                <span>•</span>
                <span>{users.length} online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0 mr-10">
            <button
              onClick={copyRoomId}
              className="p-1.5 md:p-2 rounded-lg hover:bg-vercel-light-gray dark:hover:bg-gray-800 transition-colors"
              title="Copy Room ID"
            >
              <Copy className="w-3 h-3 md:w-4 md:h-4" />
            </button>
            <button
              onClick={() => setShowUsers(!showUsers)}
              className="p-1.5 md:p-2 rounded-lg hover:bg-vercel-light-gray dark:hover:bg-gray-800 transition-colors"
              title="Toggle Users"
            >
              <Users className="w-3 h-3 md:w-4 md:h-4" />
            </button>
            <button
              onClick={() => window.location.reload()}
              className="p-1.5 md:p-2 rounded-lg hover:bg-vercel-light-gray dark:hover:bg-gray-800 transition-colors"
              title="Leave Room"
            >
              <LogOut className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 scrollbar-hide">
          <AnimatePresence>
            {recentMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  message.username === username
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.username === "system" ? (
                  <div className="message-system">{message.message}</div>
                ) : (
                  <div
                    className={`flex items-end space-x-2 ${
                      message.username === username
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-vercel-light-gray dark:bg-gray-800 flex items-center justify-center text-xs font-semibold flex-shrink-0`}
                    >
                      {message.username.charAt(0).toUpperCase()}
                    </div>
                    <div
                      className={`max-w-[200px] sm:max-w-xs lg:max-w-md ${
                        message.username === username
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {message.username !== username && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {message.username}
                        </div>
                      )}
                      <div
                        className={`message-bubble ${
                          message.username === username
                            ? "message-own"
                            : "message-other"
                        }`}
                      >
                        {message.message}
                      </div>
                      <div
                        className={`text-xs text-gray-400 mt-1 ${
                          message.username === username
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {formatTime(message.timestamp || Date.now())}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEnd} />
        </div>

        {/* Typing Indicator */}
        <TypingIndicator typingUsers={filteredTypingUsers} />

        {/* Message Input */}
        <div className="p-3 md:p-4 border-t border-vercel-border dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="flex-1 relative">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                onKeyDown={handleTyping}
                className="input pr-10 md:pr-12 text-sm md:text-base"
                placeholder="Type a message..."
                maxLength={300}
              />
              <div className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 hidden sm:block">
                {text.length}/300
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={!text.trim()}
              className="btn btn-primary p-2 md:p-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Users Sidebar */}
      <AnimatePresence>
        {showUsers && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-l border-vercel-border dark:border-gray-700 bg-vercel-light-gray dark:bg-gray-900 overflow-hidden w-64 md:w-80"
          >
            <div className="p-4 border-b border-vercel-border dark:border-gray-700">
              <h3 className="font-semibold text-vercel-black dark:text-white">
                Online Users ({users.length})
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {users.map((user, index) => (
                <motion.div
                  key={user}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-vercel-black dark:bg-white flex items-center justify-center text-xs font-semibold text-white dark:text-vercel-black">
                      {user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-vercel-black dark:text-white">
                        {user}
                        {index === 0 && (
                          <Shield className="w-3 h-3 inline ml-1" />
                        )}
                      </div>
                      <div className="text-xs text-green-500">Online</div>
                    </div>
                  </div>
                  {isAdmin && user !== username && (
                    <button
                      onClick={() => kickUser(user)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                      title="Kick user"
                    >
                      <UserMinus className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
