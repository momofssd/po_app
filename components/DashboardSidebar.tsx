import React from "react";
import { ExtractionMode, ProcessingStatus } from "../types";
import { CustomerSelector } from "./CustomerSelector";
import { FileUpload } from "./FileUpload";
import { QueueDisplay } from "./QueueDisplay";

interface DashboardSidebarProps {
  status: ProcessingStatus;
  fileQueue: File[];
  processedCount: number;
  currentProcessingFile: string | null;
  error: string | null;
  onFilesSelect: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onClearQueue: () => void;
  onStartProcessing: () => void;
  extractionMode: ExtractionMode;
  onExtractionModeChange: (mode: ExtractionMode) => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  status,
  fileQueue,
  processedCount,
  currentProcessingFile,
  error,
  onFilesSelect,
  onRemoveFile,
  onClearQueue,
  onStartProcessing,
  extractionMode,
  onExtractionModeChange,
}) => {
  return (
    <div className="lg:col-span-4 xl:col-span-3 space-y-6">
      {/* New Customer Selector */}
      <CustomerSelector />

      <div className="bg-apple-card rounded-3xl shadow-apple border border-white/50 p-8 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-apple-text tracking-tight">
            Input Documents
          </h2>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => onExtractionModeChange(ExtractionMode.IMAGE)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                extractionMode === ExtractionMode.IMAGE
                  ? "bg-white shadow-sm text-apple-blue"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Image
            </button>
            <button
              onClick={() => onExtractionModeChange(ExtractionMode.TEXT)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                extractionMode === ExtractionMode.TEXT
                  ? "bg-white shadow-sm text-apple-blue"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Text
            </button>
          </div>
        </div>
        <FileUpload
          onFilesSelect={onFilesSelect}
          disabled={status === ProcessingStatus.PROCESSING}
        />

        <QueueDisplay
          files={fileQueue}
          status={status}
          processedCount={processedCount}
          currentFile={currentProcessingFile}
          error={error}
          onRemoveFile={onRemoveFile}
          onClearQueue={onClearQueue}
          onStartProcessing={onStartProcessing}
        />
      </div>
    </div>
  );
};
