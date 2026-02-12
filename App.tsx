import React, { useEffect, useState } from "react";
import { CustomerSelector } from "./components/CustomerSelector";
import { EmptyResults } from "./components/EmptyResults";
import { FileUpload } from "./components/FileUpload";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Login } from "./components/Login";
import { QueueDisplay } from "./components/QueueDisplay";
import { ResultsTable } from "./components/ResultsTable";
import { authService } from "./services/authService";
import { customerService } from "./services/customerService";
import {
  determineShipTo,
  determineSoldTo,
  extractDataFromImages,
} from "./services/geminiService";
import { convertPdfToImages } from "./services/pdfService";
import { ProcessingStatus, PurchaseOrderLine, User } from "./types";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [data, setData] = useState<PurchaseOrderLine[]>([]);
  const [tokenUsage, setTokenUsage] = useState<{
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  }>({ promptTokens: 0, responseTokens: 0, totalTokens: 0 });
  const [error, setError] = useState<string | null>(null);
  const [fileQueue, setFileQueue] = useState<File[]>([]);
  const [processedCount, setProcessedCount] = useState(0);
  const [currentProcessingFile, setCurrentProcessingFile] = useState<
    string | null
  >(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for existing session
  useEffect(() => {
    const sessionUser = authService.getSession();
    if (sessionUser) {
      setUser(sessionUser);
    }
    setIsInitializing(false);
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    authService.logout();
  };

  const handleFilesSelect = (files: File[]) => {
    setFileQueue((prev) => [...prev, ...files]);
    setError(null);
    setStatus(ProcessingStatus.IDLE);
  };

  const removeFileFromQueue = (index: number) => {
    setFileQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setFileQueue([]);
    setData([]);
    setTokenUsage({ promptTokens: 0, responseTokens: 0, totalTokens: 0 });
    setStatus(ProcessingStatus.IDLE);
    setProcessedCount(0);
  };

  const handleDataUpdate = (
    index: number,
    field: keyof PurchaseOrderLine,
    value: any,
  ) => {
    setData((prev) => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const handleStartProcessing = async () => {
    if (fileQueue.length === 0) return;

    setStatus(ProcessingStatus.PROCESSING);
    setProcessedCount(0);
    setError(null);
    setData([]); // Start fresh for new batch
    setTokenUsage({ promptTokens: 0, responseTokens: 0, totalTokens: 0 }); // Reset tokens

    const newResults: PurchaseOrderLine[] = [];

    for (let i = 0; i < fileQueue.length; i++) {
      const file = fileQueue[i];
      setCurrentProcessingFile(file.name);

      try {
        const images = await convertPdfToImages(file);

        if (images.length === 0) {
          console.warn(`No images extracted from ${file.name}`);
          continue;
        }

        const { data: extractedLines, usage } =
          await extractDataFromImages(images);

        if (usage) {
          setTokenUsage((prev) => ({
            promptTokens: prev.promptTokens + usage.promptTokens,
            responseTokens: prev.responseTokens + usage.responseTokens,
            totalTokens: prev.totalTokens + usage.totalTokens,
          }));
        }

        // Enhance lines with Sold To and Ship To
        const enhancedLines = await Promise.all(
          extractedLines.map(async (line) => {
            let soldTo = "";
            let shipTo = "";

            if (line.customerName) {
              try {
                // 1. Narrow down candidates
                // Extract the first word (alphanumeric) to broaden the search scope
                const firstWord = line.customerName
                  .trim()
                  .split(/[^a-zA-Z0-9]+/)[0];

                // Fetch ALL candidates matching the first word (limit="none")
                const candidates = await customerService.searchCustomers(
                  firstWord,
                  "none",
                );

                if (candidates.length > 0) {
                  // 2. Determine Sold To
                  const soldToId = await determineSoldTo(
                    line.customerName,
                    candidates,
                  );

                  if (soldToId) {
                    soldTo = soldToId;

                    // 3. Determine Ship To
                    const customer =
                      candidates.find((c) => c.customer_id === soldToId) ||
                      candidates.find((c) => c._id === soldToId); // Check both just in case

                    if (customer && customer.ship_to && line.deliveryAddress) {
                      const shipToKey = await determineShipTo(
                        line.deliveryAddress,
                        customer.ship_to,
                      );
                      if (shipToKey) {
                        shipTo = shipToKey;
                      }
                    }
                  }
                }
              } catch (err) {
                console.error("Error enhancing line data:", err);
              }
            }

            return {
              ...line,
              soldTo,
              shipTo,
            };
          }),
        );

        // Create a blob URL for the PDF file
        const fileUrl = URL.createObjectURL(file);

        const linesWithSource = enhancedLines.map((line) => ({
          ...line,
          sourceFile: file.name,
          sourceUrl: fileUrl,
        }));

        newResults.push(...linesWithSource);
        setData((prev) => [...prev, ...linesWithSource]);
      } catch (err: any) {
        console.error(`Error processing ${file.name}:`, err);
        setError(
          `Error processing ${file.name}: ${err.message}. Check console for details.`,
        );
      }

      setProcessedCount((prev) => prev + 1);
    }

    setStatus(ProcessingStatus.COMPLETE);
    setCurrentProcessingFile(null);
  };

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
          {/* Left Panel: Controls & Queue (25-33%) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            {/* New Customer Selector */}
            <CustomerSelector />

            <div className="bg-apple-card rounded-3xl shadow-apple border border-white/50 p-8 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-apple-text mb-6 tracking-tight">
                Input Documents
              </h2>
              <FileUpload
                onFilesSelect={handleFilesSelect}
                disabled={status === ProcessingStatus.PROCESSING}
              />

              <QueueDisplay
                files={fileQueue}
                status={status}
                processedCount={processedCount}
                currentFile={currentProcessingFile}
                error={error}
                onRemoveFile={removeFileFromQueue}
                onClearQueue={clearQueue}
                onStartProcessing={handleStartProcessing}
              />
            </div>
          </div>

          {/* Right Panel: Results (70%) */}
          <div className="lg:col-span-8 xl:col-span-9 h-[calc(100vh-10rem)] min-h-[500px]">
            {status === ProcessingStatus.COMPLETE || data.length > 0 ? (
              <div className="h-full animate-fade-in-up">
                <ResultsTable
                  data={data}
                  tokenUsage={tokenUsage}
                  onUpdate={handleDataUpdate}
                />
              </div>
            ) : (
              <EmptyResults />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default App;
