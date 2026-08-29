import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { applyFont, FONT_STORAGE_KEY } from "./features/settings/components/PreferencesTab.jsx";

function App() {
  // Initialize stored theme, font, density, and reduce-motion on app load
  useEffect(() => {
    // 1. Theme
    const savedTheme = localStorage.getItem("meridian-theme") || "meridian-dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    // 2. Font
    const savedFont = localStorage.getItem(FONT_STORAGE_KEY) || "inter";
    applyFont(savedFont);

    // 3. Density
    const savedDensity = localStorage.getItem("meridian-density") || "comfortable";
    document.documentElement.setAttribute("data-density", savedDensity);

    // 4. Reduce motion
    const savedReduceMotion = localStorage.getItem("meridian-reduce-motion") === "true";
    document.documentElement.classList.toggle("reduce-motion", savedReduceMotion);
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
