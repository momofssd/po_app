import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultsTable } from './components/ResultsTable';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { QueueDisplay } from './components/QueueDisplay';
import { EmptyResults } from './components/EmptyResults';
import { CustomerSelector } from './components/CustomerSelector';
import { Footer } from './components/Footer';
import { convertPdfToImages } from './services/pdfService';
import { extractDataFromImages } from './services/geminiService';
import { authService } from './services/authService';
import { PurchaseOrderLine, ProcessingStatus, User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [data, setData] = useState<PurchaseOrderLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileQueue, setFileQueue] = useState<File[]>([]);
  const [processedCount, setProcessedCount] = useState(0);
  const [currentProcessingFile, setCurrentProcessingFile] = useState<string | null>(null);
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
    setFileQueue(prev => [...prev, ...files]);
    setError(null);
    setStatus(ProcessingStatus.IDLE);
  };

  const removeFileFromQueue = (index: number) => {
    setFileQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setFileQueue([]);
    setData([]);
    setStatus(ProcessingStatus.IDLE);
    setProcessedCount(0);
  };

  const handleDataUpdate = (index: number, field: keyof PurchaseOrderLine, value: any) => {
    setData(prev => {
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

        const extractedLines = await extractDataFromImages(images);
        
        const linesWithSource = extractedLines.map(line => ({
          ...line,
          sourceFile: file.name
        }));

        newResults.push(...linesWithSource);
        setData(prev => [...prev, ...linesWithSource]);

      } catch (err: any) {
        console.error(`Error processing ${file.name}:`, err);
        setError(`Error processing ${file.name}: ${err.message}. Check console for details.`);
      }

      setProcessedCount(prev => prev + 1);
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
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans text-slate-800">
      <Header user={user} onLogout={handleLogout} />

      <div className="flex-grow w-full max-w-[96%] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Controls & Queue (30%) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            
            {/* New Customer Selector */}
            <CustomerSelector />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Input Documents</h2>
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
             {(status === ProcessingStatus.COMPLETE || data.length > 0) ? (
              <div className="h-full animate-fade-in-up">
                 <ResultsTable data={data} onUpdate={handleDataUpdate} />
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