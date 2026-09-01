import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../../../redux/auth/authSlice.js";
import { LogOut, User, Settings, CreditCard, ChevronDown } from "lucide-react";

const DEFAULT_USER = {
  name: "Sarah Whitfield",
  email: "sarah.whitfield@meridianlending.com",
  role: "Senior Loan Officer",
};

// A varied, professional palette — deliberately not the app's primary/gold
// so avatars don't all blur into the same color. Each name deterministically
// hashes to the same color every time (not random per render), so a given
// person always shows up looking the same across the app.
const AVATAR_COLORS = [
  "#EF4444", // red
  "#F97316", // orange
  "#F59E0B", // amber
  "#84CC16", // lime
  "#10B981", // emerald
  "#14B8A6", // teal
  "#06B6D4", // cyan
  "#3B82F6", // blue
  "#6366F1", // indigo
  "#8B5CF6", // violet
  "#D946EF", // fuchsia
  "#EC4899", // pink
];

// "Sarah Whitfield" -> "SW", "cheran" -> "C", "" -> "?"
function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic hash so the same name always lands on the same color.
function getAvatarColor(seed = "") {
  const hash = String(seed)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function InitialsAvatar({ name, size = "w-8 h-8", textSize = "text-xs" }) {
  const color = getAvatarColor(name);
  return (
    <div
      className={`${size} rounded-full flex items-center justify-center ring-2 ring-primary/20 ring-offset-1 ring-offset-base-100 shrink-0`}
      style={{ backgroundColor: color }}
    >
      <span className={`${textSize} font-bold text-white tracking-wide`}>
        {getInitials(name)}
      </span>
    </div>
  );
}

export default function ProfileDropdown() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // Mapped to safely pull `username` and `role_name` from the getMe API,
  // falling back to defaults if they are missing.
  const currentUser = {
    name: user?.username || user?.name || user?.fullName || DEFAULT_USER.name,
    email: user?.email || DEFAULT_USER.email,
    role:
      user?.role_name || user?.role?.name || user?.role || DEFAULT_USER.role,
  };

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
    };
    const handleEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await dispatch(logoutUser());
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleProfile = () => {
    setOpen(false);
    navigate("/profile");
  };

  const handleSettings = () => {
    setOpen(false);
    navigate("/settings");
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn btn-ghost btn-sm h-11 py-1 px-1.5 md:px-2.5 gap-2 normal-case rounded-xl hover:bg-base-200 transition-all duration-150 border border-transparent hover:border-base-300"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <InitialsAvatar
          name={currentUser.name}
          size="w-8 h-8"
          textSize="text-xs"
        />

        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-xs font-semibold text-base-content">
            {currentUser.name}
          </span>
          <span className="text-[10px] text-base-content/40 font-medium">
            {currentUser.role}
          </span>
        </div>

        <ChevronDown
          size={14}
          className={`hidden sm:block text-base-content/30 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-base-100 border border-base-300 shadow-dropdown p-2 gap-0.5 z-50">
          <li className="px-3 py-3 mb-1.5 border-b border-base-200 pointer-events-none">
            <div className="flex items-center gap-3">
              <InitialsAvatar
                name={currentUser.name}
                size="w-10 h-10"
                textSize="text-sm"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-base-content truncate">
                  {currentUser.name}
                </span>
                <span className="text-[11px] text-base-content/40 font-medium truncate">
                  {currentUser.email}
                </span>
              </div>
            </div>
          </li>

          <li>
            <button
              type="button"
              onClick={handleProfile}
              className="flex items-center gap-2 w-full text-xs font-semibold py-2.5 px-3 rounded-lg text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors cursor-pointer"
            >
              <User size={15} className="text-base-content/40" /> My Profile
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 w-full text-xs font-semibold py-2.5 px-3 rounded-lg text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors cursor-pointer"
            >
              <CreditCard size={15} className="text-base-content/40" /> Billing
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={handleSettings}
              className="flex items-center gap-2 w-full text-xs font-semibold py-2.5 px-3 rounded-lg text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors cursor-pointer"
            >
              <Settings size={15} className="text-base-content/40" /> Account
              Settings
            </button>
          </li>

          <li className="border-t border-base-200 mt-1.5 pt-1.5">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 w-full text-xs font-bold py-2.5 px-3 rounded-lg text-error hover:bg-error/10 hover:text-error transition-all"
            >
              <LogOut size={15} className="opacity-80" /> Log Out
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
