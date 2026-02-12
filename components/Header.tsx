import React from "react";
import { User } from "../types";

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <nav className="bg-white/70 border-b border-slate-200/50 sticky top-0 z-30 backdrop-blur-xl">
      <div className="max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center space-x-3">
            <div className="text-apple-text">
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
            <span className="font-semibold text-lg text-apple-text tracking-tight">
              PO Extractor
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-apple-bg flex items-center justify-center text-apple-text font-medium text-xs border border-slate-200">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm text-apple-text">{user.username}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-sm text-apple-blue hover:text-apple-blueHover font-medium transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
