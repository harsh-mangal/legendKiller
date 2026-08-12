import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppErrorBoundary from "./components/AppErrorBoundary";
import "./index.css";
import App from "./App.jsx";

const root = document.getElementById("root");
if (!root) throw new Error("Admin root element is missing.");

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary><App /></AppErrorBoundary>
  </StrictMode>
);
