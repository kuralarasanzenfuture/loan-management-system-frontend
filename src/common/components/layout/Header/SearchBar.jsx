import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const [osShortcut, setOsShortcut] = useState("⌘K");

  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    setOsShortcut(isMac ? "⌘K" : "Ctrl+K");

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex-1 flex justify-center max-w-md mx-auto px-4">
      <div className="relative w-full">
        <label
          className={`
            flex items-center gap-2.5 w-full h-10 px-3 rounded-xl border bg-base-200/50
            transition-all duration-200 ease-in-out cursor-text
            ${
              focused
                ? "border-primary bg-base-100 ring-4 ring-primary/10 shadow-sm"
                : "border-base-300 hover:border-base-content/20"
            }
          `}
        >
          <Search
            size={16}
            className={`transition-colors duration-150 ${focused ? "text-primary" : "text-base-content/40"}`}
          />
          <input
            ref={inputRef}
            type="text"
            className="grow bg-transparent border-none outline-none text-sm placeholder-base-content/40 text-base-content"
            placeholder="Search loans, borrowers, files..."
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />

          <kbd
            className={`
              kbd kbd-sm hidden sm:inline-flex border-none text-[10px] font-bold px-1.5 h-5 bg-base-300 text-base-content/50 select-none
              transition-opacity duration-200 ${focused ? "opacity-0" : "opacity-100"}
            `}
          >
            {osShortcut}
          </kbd>
        </label>
      </div>
    </div>
  );
}
