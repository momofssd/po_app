import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 mt-auto">
      <div className="max-w-[98%] mx-auto px-4 text-center">
        <p className="text-[11px] text-apple-subtext font-medium tracking-wide">
          System Version: <span className="text-apple-text">v1.2.4-beta</span>{" "}
          <span className="mx-2 text-slate-300">|</span> Build: 2026.02.12
        </p>
      </div>
    </footer>
  );
};
