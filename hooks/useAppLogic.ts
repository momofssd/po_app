import { useEffect, useState } from "react";
import { authService } from "../services/authService";
import { customerService } from "../services/customerService";
import {
  determineShipTo,
  determineSoldTo,
  extractDataFromImages,
  extractDataFromText,
} from "../services/geminiService";
import { convertPdfToImages, extractPdfText } from "../services/pdfService";
import { resultsService } from "../services/resultsService";
import {
  ExtractionMode,
  ProcessingStatus,
  PurchaseOrderLine,
  User,
} from "../types";

export const useAppLogic = () => {
  const [user, setUser] = useState<User | null>(null);
  const [extractionMode, setExtractionMode] = useState<ExtractionMode>(
    ExtractionMode.IMAGE,
  );
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
  const [currentView, setCurrentView] = useState<
    "dashboard" | "customer-master"
  >("dashboard");

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

  const handleLogout = async () => {
    try {
      await resultsService.clearResults();
    } catch (e) {
      console.error("Failed to clear results on logout", e);
    }
    authService.logout();
    setUser(null);
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
        let extractedLines, usage;

        if (extractionMode === ExtractionMode.TEXT) {
          const text = await extractPdfText(file);
          const result = await extractDataFromText(text);
          extractedLines = result.data;
          usage = result.usage;
        } else {
          const images = await convertPdfToImages(file);

          if (images.length === 0) {
            console.warn(`No images extracted from ${file.name}`);
            continue;
          }

          const result = await extractDataFromImages(images);
          extractedLines = result.data;
          usage = result.usage;
        }

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
            let salesOrg = line.salesOrg || "";

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

                    // 3. Determine Ship To & Sales Org
                    const customer =
                      candidates.find((c) => c.customer_id === soldToId) ||
                      candidates.find((c) => c._id === soldToId); // Check both just in case

                    if (customer) {
                      if (customer.sales_org) {
                        salesOrg = customer.sales_org;
                      }

                      if (customer.ship_to && line.deliveryAddress) {
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
                }
              } catch (err) {
                console.error("Error enhancing line data:", err);
              }
            }

            return {
              ...line,
              soldTo,
              shipTo,
              salesOrg,
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

  return {
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
    extractionMode,
    setExtractionMode,
  };
};
