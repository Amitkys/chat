import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Users, LogOut, Copy, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWebSocket } from "@/components/providers/WebSocket-provider"; // Adjust the import path as needed

export default function ChatRoom() {
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use the WebSocket context
  const { username, roomId, userCount, messages, sendMessage } = useWebSocket();

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !username) return;

    sendMessage(newMessage);
    setNewMessage("");
  };

  const handleLeaveRoom = () => {
    // Handle leaving the room
    navigate("/");
  };

  const copyRoomIdToClipboard = () => {
    if (roomId) {
      navigator.clipboard
        .writeText(roomId)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy room ID: ", err);
        });
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return timestamp; // Already formatted in the WebSocketProvider
  };

  // Determine if message is from current user
  const isOwnMessage = (messageUsername: string) => {
    return username === messageUsername;
  };

  // If not connected, show loading or redirect
  if (!username || !roomId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Connecting to chat room...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-[74px]">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-10 border-b bg-card p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-base font-bold hidden lg:block">Room: {roomId}</h1>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {userCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Room ID with Copy Button */}
            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
              <span className="text-sm font-medium">{roomId}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyRoomIdToClipboard}>
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? "Copied!" : "Copy Room ID"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Button variant="outline" size="sm" onClick={handleLeaveRoom}>
              <LogOut className="h-4 w-4 mr-2" />
              Leave Room
            </Button>
          </div>
        </div>
      </header>


      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-10">
        <div className="container mx-auto max-w-4xl space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${isOwnMessage(message.username) ? "justify-end" : "justify-start"}`}
            >
              {!isOwnMessage(message.username) && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{getInitials(message.username)}</AvatarFallback>
                </Avatar>
              )}

              <div className={`max-w-[80%] ${isOwnMessage(message.username) ? "items-end" : "items-start"}`}>
                {!isOwnMessage(message.username) && <div className="text-sm font-medium mb-1">{message.username}</div>}

                <div className="flex flex-col">
                  <div
                    className={`rounded-lg px-3 py-2 ${isOwnMessage(message.username) ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                  >
                    {message.message}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">{formatTime(message.timestamp)}</span>
                </div>
              </div>

              {isOwnMessage(message.username) && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{getInitials(message.username)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="fixed bottom-0 left-0 w-full bg-card border-t p-4">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </div>
      </div>

    </div>
  );
}