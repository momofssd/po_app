import React from "react";

export const EmptyResults: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-apple-subtext border-2 border-dashed border-slate-200/60 rounded-3xl bg-white/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-white p-6 rounded-3xl mb-6 shadow-sm shadow-slate-200/50">
        <svg
          className="h-12 w-12 text-apple-subtext/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-apple-text mb-3 tracking-tight">
        Ready to Extract
      </h3>
      <p className="text-apple-subtext max-w-sm text-center text-[15px] font-light leading-relaxed">
        Upload your Purchase Order PDFs to automatically extract line items
        using Gemini AI.
      </p>
    </div>
  );
};
