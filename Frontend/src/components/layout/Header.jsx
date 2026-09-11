
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  Bell,
  User,
  Menu,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";
import { Link } from "react-router-dom";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      className="
        sticky top-0 z-40 w-full h-16
        bg-white/70 dark:bg-slate-950/75
        backdrop-blur-xl
        border-b border-white/70 dark:border-slate-800/70
        shadow-sm shadow-blue-100/40 dark:shadow-black/20
        transition-colors duration-300
      "
    >
      <div className="flex items-center justify-between h-full px-6">

        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="
            md:hidden
            inline-flex items-center justify-center
            w-10 h-10
            rounded-xl
            text-slate-600 dark:text-slate-300
            hover:text-sky-600 dark:hover:text-sky-400
            hover:bg-sky-50/80 dark:hover:bg-slate-800
            transition-all duration-200
          "
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:block" />

        <div className="flex items-center gap-2">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="
              relative
              inline-flex items-center justify-center
              w-10 h-10
              rounded-xl
              text-slate-600 dark:text-slate-300
              hover:text-sky-600 dark:hover:text-sky-400
              hover:bg-sky-50/80 dark:hover:bg-slate-800
              transition-all duration-200
            "
            aria-label={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? (
              <Sun
                size={20}
                strokeWidth={2}
                className="transition-transform duration-300 hover:rotate-45"
              />
            ) : (
              <Moon
                size={20}
                strokeWidth={2}
                className="transition-transform duration-300 hover:-rotate-12"
              />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() =>
                setShowNotifications((prev) => !prev)
              }
              className="
                relative
                inline-flex items-center justify-center
                w-10 h-10
                rounded-xl
                text-slate-600 dark:text-slate-300
                hover:text-sky-600 dark:hover:text-sky-400
                hover:bg-sky-50/80 dark:hover:bg-slate-800
                transition-all duration-200
                group
              "
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <Bell
                size={20}
                strokeWidth={2}
                className="group-hover:scale-105 transition-transform duration-200"
              />

              <span
                className="
                  absolute top-1.5 right-1.5
                  w-2 h-2
                  bg-sky-400
                  rounded-full
                  ring-2 ring-white dark:ring-slate-950
                "
              />
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div
                className="
                  absolute right-0 mt-3
                  w-80 max-w-[calc(100vw-2rem)]
                  bg-white/95 dark:bg-slate-900/95
                  backdrop-blur-xl
                  border border-white/80 dark:border-slate-700/70
                  rounded-2xl
                  shadow-xl shadow-blue-100/60 dark:shadow-black/30
                  overflow-hidden
                  z-50
                "
              >
                <div
                  className="
                    flex items-center justify-between
                    px-4 py-3
                    border-b border-slate-100 dark:border-slate-800
                  "
                >
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Notifications
                  </h3>

                  <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                    1 new
                  </span>
                </div>

                <div className="p-4 hover:bg-sky-50/60 dark:hover:bg-slate-800/70 transition-colors">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center">
                      <CheckCircle2
                        size={18}
                        className="text-sky-500"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        Welcome to AI Learning Assistant
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Start uploading documents and begin learning.
                      </p>

                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                        Just now
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    px-4 py-3
                    bg-slate-50/60 dark:bg-slate-950/50
                    border-t border-slate-100 dark:border-slate-800
                  "
                >
                  <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                    You're all caught up
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <Link to="/profile">
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200/60 dark:border-slate-700/60">
              <div
                className="
                  flex items-center gap-3
                  px-3 py-1.5
                  rounded-xl
                  hover:bg-sky-50/60 dark:hover:bg-slate-800/70
                  transition-colors duration-200
                  cursor-pointer
                  group
                "
              >
                <div
                  className="
                    w-9 h-9
                    rounded-xl
                    bg-gradient-to-br from-sky-300 to-blue-500
                    flex items-center justify-center
                    text-white
                    shadow-md shadow-blue-400/20
                    group-hover:shadow-lg group-hover:shadow-blue-400/30
                    group-hover:scale-[1.02]
                    transition-all duration-200
                  "
                >
                  <User size={18} strokeWidth={2.5} />
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user?.username || "User"}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </header>
  );
};

export default Header;

