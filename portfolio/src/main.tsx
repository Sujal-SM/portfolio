import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { restoreAccent } from "./lib/theme";

restoreAccent();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// offline support in production builds (skipped in the single-file preview build)
if (import.meta.env.PROD && "serviceWorker" in navigator && !import.meta.env.VITE_NO_SW) {
  addEventListener("load", () => { navigator.serviceWorker.register("/sw.js").catch(() => undefined); });
}
