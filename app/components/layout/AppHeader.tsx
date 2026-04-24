"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSidebar } from "../../context/SidebarContext";
import { useTheme } from "../../context/ThemeContext";
import { logout } from "@/app/actions/auth";
import {
  Menu,
  Search,
  Moon,
  Sun,
  User as UserIcon,
  ChevronDown,
  LogOut,
} from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function AppHeader({ user }: { user: any }) {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            onClick={handleToggle}
            className="z-50 block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1.5 text-gray-500 dark:text-gray-400 lg:hidden shadow-sm"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="hidden sm:block">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Cari tiket..."
              className="w-full xl:w-96 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            <li>
              <button
                onClick={toggleTheme}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-brand-500 shadow-sm transition-colors"
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </li>
            <li>
              <NotificationBell />
            </li>
          </ul>

          {/* Profile dropdown - desktop only */}
          <div ref={profileRef} className="relative hidden lg:flex items-center gap-3 border-l border-gray-200 dark:border-gray-800 pl-4 md:pl-6">
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-3"
            >
              <div className="text-right">
                <span className="block text-sm font-medium text-gray-800 dark:text-white">{user?.name}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">{user?.role}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 overflow-hidden shadow-sm">
                <UserIcon size={20} />
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {profileOpen && (
              <div className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-theme-lg py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Keluar
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
