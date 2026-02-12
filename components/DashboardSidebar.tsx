import React from "react";
import { ProcessingStatus } from "../types";
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
}) => {
  return (
    <div className="lg:col-span-4 xl:col-span-3 space-y-6">
      {/* New Customer Selector */}
      <CustomerSelector />

      <div className="bg-apple-card rounded-3xl shadow-apple border border-white/50 p-8 backdrop-blur-xl">
        <h2 className="text-xl font-semibold text-apple-text mb-6 tracking-tight">
          Input Documents
        </h2>
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
