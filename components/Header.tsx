import React from "react";
import { User } from "../types";

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onNavigate?: (view: "dashboard" | "customer-master") => void;
  currentView?: string;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onNavigate,
  currentView,
}) => {
  return (
    <nav className="bg-white border-b border-brand-border sticky top-0 z-30">
      <div className="h-1 bg-brand-primary" />
      <div className="max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-stretch space-x-3">
            <div className="flex items-center text-brand-primary">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  strokeWidth={2}
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              className="flex items-center font-bold text-xl text-brand-primary tracking-tight cursor-pointer"
              onClick={() => onNavigate?.("dashboard")}
            >
              PO Extractor
            </span>

            {user.role === "admin" && onNavigate && (
              <div className="hidden md:flex items-stretch ml-10 space-x-8">
                <button
                  onClick={() => onNavigate("dashboard")}
                  className={`text-[15px] font-semibold border-b-[3px] pt-[3px] transition-colors ${
                    currentView === "dashboard"
                      ? "text-brand-text border-brand-primary"
                      : "text-brand-subtext border-transparent hover:text-brand-text hover:border-neutral-300"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onNavigate("customer-master")}
                  className={`text-[15px] font-semibold border-b-[3px] pt-[3px] transition-colors ${
                    currentView === "customer-master"
                      ? "text-brand-text border-brand-primary"
                      : "text-brand-subtext border-transparent hover:text-brand-text hover:border-neutral-300"
                  }`}
                >
                  Customer Master
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-brand-dark flex items-center justify-center text-white font-semibold text-xs">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm text-brand-text">{user.username}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-sm font-semibold px-5 py-1.5 rounded-full border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
