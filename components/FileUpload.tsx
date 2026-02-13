import React, { useCallback, useState } from "react";

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelect,
  disabled,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files) as File[];
        const pdfFiles = droppedFiles.filter(
          (f) => f.type === "application/pdf",
        );

        if (pdfFiles.length > 0) {
          onFilesSelect(pdfFiles);
        } else {
          alert("Please select PDF files.");
        }
      }
    },
    [disabled, onFilesSelect],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFiles = Array.from(e.target.files);
        onFilesSelect(selectedFiles);
      }
    },
    [onFilesSelect],
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        group relative border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-300 ease-out
        ${
          isDragging
            ? "border-apple-blue bg-blue-50/30 scale-[1.01] shadow-xl shadow-blue-100/50"
            : "border-slate-200/60 hover:border-apple-blue/50 hover:bg-apple-bg/50 bg-slate-50/30"
        }
        ${disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : "cursor-pointer"}
      `}
    >
      <input
        type="file"
        accept="application/pdf"
        multiple
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        onChange={handleInputChange}
        disabled={disabled}
      />

      <div className="flex flex-col items-center justify-center space-y-2 relative">
        <div
          className={`
          p-3 rounded-full transition-all duration-300
          ${isDragging ? "bg-blue-100 text-apple-blue" : "bg-white text-apple-subtext group-hover:bg-blue-50 group-hover:text-apple-blue shadow-sm"}
        `}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-[15px] font-medium text-apple-text group-hover:text-apple-blue transition-colors">
            {isDragging ? "Drop Files Here" : "Upload Documents"}
          </h3>
          <p className="text-xs text-apple-subtext mt-1.5 max-w-[200px] mx-auto leading-relaxed font-light">
            Drag PDF files here, or{" "}
            <span className="text-apple-blue hover:underline decoration-apple-blue/30 underline-offset-2">
              browse
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
