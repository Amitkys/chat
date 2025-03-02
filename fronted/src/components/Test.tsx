import { Button } from "./ui/button";
import { useEffect, useRef } from "react";

// Define the structure of the joining data
interface JoiningData {
    type: string;
    username: string;
    roomId: string;
}

const joiningData: JoiningData = {
    type: "join",
    username: "sabnam",
    roomId: "89DWF",
};

export default function Test() {
    // Use `useRef` to store the WebSocket instance
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Create WebSocket connection when the component mounts
        ws.current = new WebSocket("ws://localhost:3000");

        // Handle connection open
        ws.current.onopen = () => {
            console.log("WebSocket connection established");
        };

        // Handle incoming messages
        ws.current.onmessage = (event: MessageEvent) => {
            console.log("Message from server:", event.data);
        };

        // Handle errors
        ws.current.onerror = (error: Event) => {
            console.error("WebSocket error:", error);
        };

        // Handle connection close
        ws.current.onclose = () => {
            console.log("WebSocket connection closed");
        };

        // Cleanup on component unmount
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    const joinRoomHandler = () => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            // Send the joining data as a JSON string
            ws.current.send(JSON.stringify(joiningData));
            console.log("Joining data sent:", joiningData);
        } else {
            console.error("WebSocket is not open");
        }
    };

    return (
        <Button onClick={joinRoomHandler}>Join Room</Button>
    );
}