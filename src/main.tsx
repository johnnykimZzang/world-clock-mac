import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";

if (!("__TAURI_INTERNALS__" in window)) {
  document.documentElement.classList.add("browser-preview");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
