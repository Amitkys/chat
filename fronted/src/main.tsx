import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { WebSocketProvider } from "@/components/providers/WebSocket-provider.tsx"; // Import WebSocketProvider

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <WebSocketProvider>
        <main>
          <App />
        </main>
      </WebSocketProvider>
    </ThemeProvider>
  </StrictMode>
);
