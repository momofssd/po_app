import React, { useCallback, useEffect, useRef, useState } from "react";
import { CustomerMaster } from "./components/CustomerMaster";
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
    currentView,
    setCurrentView,
  } = useAppLogic();

  const [rightPanelWidth, setRightPanelWidth] = useState(66.66); // Initial width in percentage
  const [isLg, setIsLg] = useState(window.innerWidth >= 1024);
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsLg(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const gapWidth = 32; // 8 * 4px (gap-8)
    const availableWidth = containerRect.width - gapWidth;
    const mouseXInContainer = e.clientX - containerRect.left;
    const rightPanelPx = containerRect.right - e.clientX;
    const newWidth = (rightPanelPx / containerRect.width) * 100;

    // Constraints: Right panel between 40% and 85%
    if (newWidth >= 40 && newWidth <= 85) {
      setRightPanelWidth(newWidth);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  if (isInitializing) {
    return <div className="min-h-screen bg-[#f8fafc]"></div>; // Prevent flash
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-apple-bg font-sans text-apple-text selection:bg-apple-blue selection:text-white">
      <Header
        user={user}
        onLogout={handleLogout}
        onNavigate={setCurrentView}
        currentView={currentView}
      />

      <div className="flex-grow w-full max-w-[98%] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {currentView === "dashboard" ? (
          <div
            ref={containerRef}
            className="flex flex-col lg:flex-row gap-8 relative"
          >
            <div
              className="w-full lg:w-auto"
              style={{
                flex: isLg
                  ? `0 0 calc(${100 - rightPanelWidth}% - 1rem)`
                  : "1 1 auto",
              }}
            >
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
            </div>

            {/* Resizable Divider */}
            <div
              className="hidden lg:block absolute top-0 bottom-0 cursor-col-resize z-10 w-8 -ml-8 group"
              style={{ left: `calc(${100 - rightPanelWidth}% + 1rem)` }}
              onMouseDown={startResizing}
            >
              <div className="h-full w-[2px] bg-apple-blue/10 group-hover:bg-apple-blue/40 transition-colors mx-auto relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-10 bg-white border border-apple-blue/20 rounded-lg shadow-sm flex items-center justify-center group-hover:border-apple-blue/40 transition-all">
                  <div className="flex gap-[2px]">
                    <div className="w-1 h-4 bg-apple-blue/20 rounded-full group-hover:bg-apple-blue/40" />
                    <div className="w-1 h-4 bg-apple-blue/20 rounded-full group-hover:bg-apple-blue/40" />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="w-full lg:w-auto"
              style={{
                flex: isLg
                  ? `0 0 calc(${rightPanelWidth}% - 1rem)`
                  : "1 1 auto",
              }}
            >
              <DashboardResults
                status={status}
                data={data}
                tokenUsage={tokenUsage}
                onUpdate={handleDataUpdate}
              />
            </div>
          </div>
        ) : (
          <CustomerMaster onBack={() => setCurrentView("dashboard")} />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default App;
