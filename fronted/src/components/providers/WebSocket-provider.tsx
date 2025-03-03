import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface Message {
  roomId: string;
  username: string;
  message: string;
  timestamp: string;
}

interface WebSocketContextType {
  ws: WebSocket | null;
  username: string | null;
  roomId: string | null;
  userCount: number;
  messages: Message[];
  joinRoom: (username: string, roomId: string) => void;
  sendMessage: (message: string) => void;
}

// Storage keys
const STORAGE_KEYS = {
  USERNAME: "chat_username",
  ROOM_ID: "chat_roomId",
  MESSAGES: "chat_messages"
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage if available
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [username, setUsername] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERNAME);
    return saved ? saved : null;
  });
  const [roomId, setRoomId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROOM_ID);
    return saved ? saved : null;
  });
  const [userCount, setUserCount] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return saved ? JSON.parse(saved) : [];
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (username) {
      localStorage.setItem(STORAGE_KEYS.USERNAME, username);
    }
  }, [username]);

  useEffect(() => {
    if (roomId) {
      localStorage.setItem(STORAGE_KEYS.ROOM_ID, roomId);
    }
  }, [roomId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  // WebSocket connection setup
  useEffect(() => {
    const websocket = new WebSocket("wss://chat-2-otss.onrender.com/");

    websocket.onopen = () => {
      console.log("Connected to WebSocket");
      setWs(websocket);
      
      // If we have stored credentials, automatically rejoin the room
      if (username && roomId) {
        setTimeout(() => {
          const data = { type: "join", username, roomId };
          websocket.send(JSON.stringify(data));
          console.log("Auto-rejoining room:", data);
        }, 500); // Small delay to ensure connection is ready
      }
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket Message:", data);

      if (data.type === "userCount") {
        setUserCount(data.userCount);
      } else if (data.type === "message") {
        // Format the timestamp to show hours:minutes AM/PM
        const now = new Date();
        const formattedTime = now.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
        
        setMessages((prev) => [
          ...prev,
          {
            roomId: data.roomId,
            username: data.username,
            message: data.message,
            timestamp: formattedTime,
          },
        ]);
      }
    };

    websocket.onclose = () => {
      console.log("WebSocket Disconnected");
      setWs(null);
    };

    websocket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => {
      websocket.close(); // Cleanup WebSocket connection on unmount
    };
  }, []); // Empty dependency array to run only once

  function joinRoom(username: string, roomId: string) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const data = { type: "join", username, roomId };
      ws.send(JSON.stringify(data));
      console.log("Joining room:", data);

      // Store username and roomId in state
      setUsername(username);
      setRoomId(roomId);
    } else {
      console.log("WebSocket is not ready yet.");
    }
  }

  function sendMessage(message: string) {
    if (ws && ws.readyState === WebSocket.OPEN && roomId && username) {
      const data = { type: "message", message };
      ws.send(JSON.stringify(data));
    } else {
      console.log("Cannot send message, WebSocket not ready.");
    }
  }

  return (
    <WebSocketContext.Provider value={{ ws, username, roomId, userCount, messages, joinRoom, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}

// Utility function to clear chat history if needed
export function clearChatHistory() {
  localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  localStorage.removeItem(STORAGE_KEYS.USERNAME);
  localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
}