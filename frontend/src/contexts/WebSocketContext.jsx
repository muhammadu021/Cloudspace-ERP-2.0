import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import DemoSocket from "@/services/demo/demoSocket";

let io = null;
// Lazy load real socket.io-client only in production mode
const loadRealSocket = async () => {
  if (io) return io;
  try {
    const mod = await import("socket.io-client");
    io = mod.io;
    return io;
  } catch (e) {
    console.warn("Failed to load socket.io-client:", e);
    return null;
  }
};

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user, token, demoMode } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map()); // threadId -> Set of userIds
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (demoMode) {
      console.log("🎭 Demo mode: using local socket mock");
      const demoSocket = new DemoSocket();
      setSocket(demoSocket);
      setIsConnected(true); // DemoSocket connects itself
      socketRef.current = demoSocket;
      return () => {
        demoSocket.disconnect();
      };
    }

    if (!user || !token) {
      if (socketRef.current) {
        console.log("🔌 Disconnecting WebSocket (no user or token)");
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    console.log("🔌 Initializing WebSocket connection for user:", user.email);

    (async () => {
      const socketIo = await loadRealSocket();
      if (!socketIo) {
        console.error("Failed to load socket.io-client");
        return;
      }

      // Create socket connection
      const newSocket = socketIo(
        import.meta.env.VITE_API_URL || "http://localhost:5050",
        {
          auth: {
            token: token,
          },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        }
      );

      // Connection event handlers
      newSocket.on("connect", () => {
        console.log("✅ WebSocket connected");
        setIsConnected(true);

        // Clear any pending reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      newSocket.on("disconnect", (reason) => {
        console.log("🔌 WebSocket disconnected:", reason);
        setIsConnected(false);

        // Attempt to reconnect after a delay
        if (reason === "io server disconnect") {
          // Server disconnected, try to reconnect
          reconnectTimeoutRef.current = setTimeout(() => {
            newSocket.connect();
          }, 2000);
        }
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ WebSocket connection error:", error.message);
        setIsConnected(false);
      });

      // Presence updates
      newSocket.on("presence:update", (data) => {
        const { userId, status } = data;
        setOnlineUsers((prev) => {
          const updated = new Set(prev);
          if (status === "online") {
            updated.add(userId);
          } else {
            updated.delete(userId);
          }
          return updated;
        });
      });

      // Typing indicators
      newSocket.on("typing:started", (data) => {
        const { threadId, userId } = data;
        setTypingUsers((prev) => {
          const updated = new Map(prev);
          if (!updated.has(threadId)) {
            updated.set(threadId, new Set());
          }
          updated.get(threadId).add(userId);
          return updated;
        });
      });

      newSocket.on("typing:stopped", (data) => {
        const { threadId, userId } = data;
        setTypingUsers((prev) => {
          const updated = new Map(prev);
          if (updated.has(threadId)) {
            updated.get(threadId).delete(userId);
            if (updated.get(threadId).size === 0) {
              updated.delete(threadId);
            }
          }
          return updated;
        });
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    })();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, token, demoMode]);

  // Send message
  const sendMessage = useCallback(
    (threadId, messageData) => {
      if (socket && isConnected) {
        socket.emit("message:send", {
          threadId,
          ...messageData,
        });
      }
    },
    [socket, isConnected]
  );

  // Mark message as delivered
  const markMessageDelivered = useCallback(
    (messageId, employeeId) => {
      if (socket && isConnected) {
        socket.emit("message:delivered", {
          messageId,
          employeeId,
        });
      }
    },
    [socket, isConnected]
  );

  // Mark message as read
  const markMessageRead = useCallback(
    (messageId, threadId, employeeId) => {
      if (socket && isConnected) {
        socket.emit("message:read", {
          messageId,
          threadId,
          employeeId,
        });
      }
    },
    [socket, isConnected]
  );

  // Start typing indicator
  const startTyping = useCallback(
    (threadId) => {
      if (socket && isConnected) {
        socket.emit("typing:start", { threadId });
      }
    },
    [socket, isConnected]
  );

  // Stop typing indicator
  const stopTyping = useCallback(
    (threadId) => {
      if (socket && isConnected) {
        socket.emit("typing:stop", { threadId });
      }
    },
    [socket, isConnected]
  );

  // Update presence status
  const updatePresence = useCallback(
    (status) => {
      if (socket && isConnected) {
        socket.emit("presence:update", { status });
      }
    },
    [socket, isConnected]
  );

  // Join a thread room
  const joinThread = useCallback(
    (threadId) => {
      if (socket && isConnected) {
        socket.emit("thread:join", { threadId });
      }
    },
    [socket, isConnected]
  );

  // Leave a thread room
  const leaveThread = useCallback(
    (threadId) => {
      if (socket && isConnected) {
        socket.emit("thread:leave", { threadId });
      }
    },
    [socket, isConnected]
  );

  // Subscribe to events
  const on = useCallback(
    (event, handler) => {
      if (socket) {
        socket.on(event, handler);
        return () => socket.off(event, handler);
      }
      return () => {};
    },
    [socket]
  );

  // Unsubscribe from events
  const off = useCallback(
    (event, handler) => {
      if (socket) {
        socket.off(event, handler);
      }
    },
    [socket]
  );

  const value = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    markMessageDelivered,
    markMessageRead,
    startTyping,
    stopTyping,
    updatePresence,
    joinThread,
    leaveThread,
    on,
    off,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;
