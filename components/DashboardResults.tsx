import React from "react";
import { ProcessingStatus, PurchaseOrderLine } from "../types";
import { EmptyResults } from "./EmptyResults";
import { ResultsTable } from "./ResultsTable";

interface DashboardResultsProps {
  status: ProcessingStatus;
  data: PurchaseOrderLine[];
  tokenUsage: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
  onUpdate: (index: number, field: keyof PurchaseOrderLine, value: any) => void;
}

export const DashboardResults: React.FC<DashboardResultsProps> = ({
  status,
  data,
  tokenUsage,
  onUpdate,
}) => {
  return (
    <div className="lg:col-span-8 xl:col-span-9 h-[calc(100vh-10rem)] min-h-[500px]">
      {status === ProcessingStatus.COMPLETE || data.length > 0 ? (
        <div className="h-full animate-fade-in-up">
          <ResultsTable
            data={data}
            tokenUsage={tokenUsage}
            onUpdate={onUpdate}
          />
        </div>
      ) : (
        <EmptyResults />
      )}
    </div>
  );
};
