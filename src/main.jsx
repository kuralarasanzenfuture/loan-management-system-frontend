import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./app/store.js";
import { applyFont, FONT_STORAGE_KEY } from "./features/settings/components/PreferencesTab.jsx";

// Initialize font early to eliminate font flash on reload
try {
  const savedFont = localStorage.getItem(FONT_STORAGE_KEY) || "inter";
  applyFont(savedFont);
} catch (e) {
  // Ignore storage exceptions
}

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
