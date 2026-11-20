import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 mt-auto bg-white border-t border-brand-border">
      <div className="max-w-[98%] mx-auto px-4 text-center">
        <p className="text-[11px] text-brand-subtext font-medium tracking-wide">
          System Version: <span className="text-brand-text">v1.2.4-beta</span>{" "}
          <span className="mx-2 text-neutral-300">|</span> Build: 2026.02.12
        </p>
      </div>
    </footer>
  );
};
