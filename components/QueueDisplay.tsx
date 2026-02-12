import React from 'react';
import { ProcessingStatus } from '../types';

interface QueueDisplayProps {
  files: File[];
  status: ProcessingStatus;
  processedCount: number;
  currentFile: string | null;
  error: string | null;
  onRemoveFile: (index: number) => void;
  onClearQueue: () => void;
  onStartProcessing: () => void;
}

export const QueueDisplay: React.FC<QueueDisplayProps> = ({
  files,
  status,
  processedCount,
  currentFile,
  error,
  onRemoveFile,
  onClearQueue,
  onStartProcessing
}) => {
  return (
    <div className="space-y-6">
      {/* Queue List */}
      {files.length > 0 && (
        <div className="mt-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Queue ({files.length})
            </h3>
            {status !== ProcessingStatus.PROCESSING && (
              <button 
                onClick={onClearQueue}
                className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="bg-slate-50 rounded-xl border border-slate-100 max-h-[400px] overflow-y-auto custom-scrollbar p-2">
            <ul className="space-y-1">
              {files.map((file, idx) => (
                <li key={`${file.name}-${idx}`} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
                  <div className="flex items-center space-x-3 w-4/5">
                    <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v15a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate text-sm font-medium text-slate-600" title={file.name}>{file.name}</span>
                  </div>
                  
                  {status !== ProcessingStatus.PROCESSING && (
                    <button 
                      onClick={() => onRemoveFile(idx)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  
                  {status === ProcessingStatus.PROCESSING && (
                    <div className="flex-shrink-0">
                      {idx < processedCount ? (
                        <span className="text-emerald-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      ) : idx === processedCount ? (
                        <span className="text-indigo-500 animate-spin">
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-200"></span>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {status !== ProcessingStatus.PROCESSING && (
             <button
                onClick={onStartProcessing}
                className="mt-6 w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:translate-y-0.5 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all"
              >
                Start Processing Batch
              </button>
          )}
          
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs border border-red-100">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Processing Status Card */}
      {status === ProcessingStatus.PROCESSING && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-fade-in">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Analysis in Progress</span>
                <p className="text-2xl font-bold text-slate-800 mt-1">{Math.round(((processedCount) / files.length) * 100)}%</p>
              </div>
              <span className="text-sm font-medium text-slate-500">{processedCount} / {files.length} Files</span>
            </div>
            
            <div className="relative w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="absolute h-full rounded-full bg-indigo-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                style={{ width: `${((processedCount) / files.length) * 100}%` }}
              ></div>
               <div className="absolute h-full bg-white/30 w-full animate-[shimmer_1.5s_infinite]"></div>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-3 flex items-start space-x-3">
              <svg className="w-5 h-5 text-indigo-500 mt-0.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <p className="text-xs text-indigo-800 font-semibold">Current Task</p>
                <p className="text-xs text-indigo-600 truncate max-w-[200px]">Extracting data from {currentFile}...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};