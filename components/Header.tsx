import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-[96%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="font-bold text-xl text-white tracking-tight">PO Extractor</span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 bg-slate-800/50 py-1.5 px-3 rounded-full border border-slate-700/50">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-xs border border-indigo-400">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-medium text-slate-200">{user.username}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="text-sm text-slate-400 hover:text-white font-medium transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};