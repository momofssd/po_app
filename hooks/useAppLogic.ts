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

    // Caches to avoid redundant Gemini calls across files/lines
    const soldToCache = new Map<string, { id: string; candidates: any[] }>();
    const shipToCache = new Map<string, string>();

    // Process files with limited concurrency (e.g., 2 at a time to avoid heavy rate limits)
    const CONCURRENCY_LIMIT = 2;
    const filesToProcess = [...fileQueue];

    const processFile = async (file: File) => {
      setCurrentProcessingFile(file.name);

      try {
        let extractedLines: PurchaseOrderLine[] = [],
          usage;

        if (extractionMode === ExtractionMode.TEXT) {
          const text = await extractPdfText(file);
          const wordCount = text
            ? text.split(/\s+/).filter((w) => w.length > 0).length
            : 0;

          if (wordCount < 10) {
            const images = await convertPdfToImages(file);
            const result = await extractDataFromImages(images);
            extractedLines = result.data;
            usage = result.usage;
          } else {
            const result = await extractDataFromText(text);
            extractedLines = result.data;
            usage = result.usage;
          }
        } else {
          const images = await convertPdfToImages(file);
          if (images.length > 0) {
            const result = await extractDataFromImages(images);
            extractedLines = result.data;
            usage = result.usage;
          }
        }

        if (usage) {
          setTokenUsage((prev) => ({
            promptTokens: prev.promptTokens + usage.promptTokens,
            responseTokens: prev.responseTokens + usage.responseTokens,
            totalTokens: prev.totalTokens + usage.totalTokens,
          }));
        }

        // Enhance lines in parallel
        const enhancedLines = await Promise.all(
          extractedLines.map(async (line) => {
            let soldTo = "";
            let shipTo = "";
            let salesOrg = line.salesOrg || "";

            if (line.customerName) {
              try {
                const customerKey = line.customerName.trim().toLowerCase();
                let soldToData = soldToCache.get(customerKey);

                if (!soldToData) {
                  const firstWord = line.customerName
                    .trim()
                    .split(/[^a-zA-Z0-9]+/)[0];
                  const candidates = await customerService.searchCustomers(
                    firstWord,
                    "none",
                  );

                  if (candidates.length > 0) {
                    const soldToId = await determineSoldTo(
                      line.customerName,
                      candidates,
                    );
                    if (soldToId) {
                      soldToData = { id: soldToId, candidates };
                      soldToCache.set(customerKey, soldToData);
                    }
                  }
                }

                if (soldToData) {
                  soldTo = soldToData.id;
                  const customer = soldToData.candidates.find(
                    (c) => c.customer_id === soldTo || c._id === soldTo,
                  );

                  if (customer) {
                    if (customer.sales_org) salesOrg = customer.sales_org;

                    if (customer.ship_to && line.deliveryAddress) {
                      const shipToKeyInput = `${soldTo}_${line.deliveryAddress.trim().toLowerCase()}`;
                      let cachedShipTo = shipToCache.get(shipToKeyInput);

                      if (!cachedShipTo) {
                        const determined = await determineShipTo(
                          line.deliveryAddress,
                          customer.ship_to,
                        );
                        if (determined) {
                          cachedShipTo = determined;
                          shipToCache.set(shipToKeyInput, determined);
                        }
                      }
                      if (cachedShipTo) shipTo = cachedShipTo;
                    }
                  }
                }
              } catch (err) {
                console.error("Error enhancing line data:", err);
              }
            }

            return { ...line, soldTo, shipTo, salesOrg };
          }),
        );

        const fileUrl = URL.createObjectURL(file);
        const linesWithSource = enhancedLines.map((line) => ({
          ...line,
          sourceFile: file.name,
          sourceUrl: fileUrl,
        }));

        setData((prev) => [...prev, ...linesWithSource]);
      } catch (err: any) {
        console.error(`Error processing ${file.name}:`, err);
        setError(`Error processing ${file.name}: ${err.message}`);
      } finally {
        setProcessedCount((prev) => prev + 1);
      }
    };

    // Execute with limited concurrency
    for (let i = 0; i < filesToProcess.length; i += CONCURRENCY_LIMIT) {
      const chunk = filesToProcess.slice(i, i + CONCURRENCY_LIMIT);
      await Promise.all(chunk.map(processFile));
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
