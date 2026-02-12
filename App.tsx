import React from "react";
import { DashboardResults } from "./components/DashboardResults";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Login } from "./components/Login";
import { useAppLogic } from "./hooks/useAppLogic";

const App: React.FC = () => {
  const {
    user,
    status,
    data,
    tokenUsage,
    error,
    fileQueue,
    processedCount,
    currentProcessingFile,
    isInitializing,
    handleLoginSuccess,
    handleLogout,
    handleFilesSelect,
    removeFileFromQueue,
    clearQueue,
    handleDataUpdate,
    handleStartProcessing,
  } = useAppLogic();

  if (isInitializing) {
    return <div className="min-h-screen bg-[#f8fafc]"></div>; // Prevent flash
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-apple-bg font-sans text-apple-text selection:bg-apple-blue selection:text-white">
      <Header user={user} onLogout={handleLogout} />

      <div className="flex-grow w-full max-w-[98%] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <DashboardSidebar
            status={status}
            fileQueue={fileQueue}
            processedCount={processedCount}
            currentProcessingFile={currentProcessingFile}
            error={error}
            onFilesSelect={handleFilesSelect}
            onRemoveFile={removeFileFromQueue}
            onClearQueue={clearQueue}
            onStartProcessing={handleStartProcessing}
          />

          <DashboardResults
            status={status}
            data={data}
            tokenUsage={tokenUsage}
            onUpdate={handleDataUpdate}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default App;
