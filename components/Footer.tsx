import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 mt-auto border-t border-slate-200 bg-white">
      <div className="max-w-[96%] mx-auto px-4 text-center">
        <p className="text-xs text-slate-400 font-mono">
          System Version: <span className="text-slate-600 font-semibold">v1.2.4-beta</span> | Build: 2025.02.26
        </p>
      </div>
    </footer>
  );
};