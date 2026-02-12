import React from "react";
import { PurchaseOrderLine } from "../types";

interface ResultsTableProps {
  data: PurchaseOrderLine[];
  tokenUsage?: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
  onUpdate: (index: number, field: keyof PurchaseOrderLine, value: any) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  tokenUsage,
  onUpdate,
}) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-center text-apple-subtext bg-white/50 rounded-3xl border border-dashed border-slate-200/60 backdrop-blur-sm">
        <div className="space-y-2">
          <p className="font-medium text-lg">No Data Available</p>
          <p className="text-sm opacity-70">
            Process documents to see results here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl shadow-apple border border-white/50 flex flex-col h-full overflow-hidden backdrop-blur-xl">
      <div className="px-8 py-6 border-b border-slate-100 bg-white/80 flex justify-between items-center sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-1.5 bg-apple-blue rounded-full shadow-sm shadow-blue-200"></div>
          <h3 className="text-xl font-semibold text-apple-text tracking-tight">
            Extracted Line Items{" "}
            <span className="ml-3 text-xs py-1 px-2.5 bg-blue-50 text-apple-blue rounded-full font-medium border border-blue-100">
              {data.length}
            </span>
          </h3>
          {tokenUsage && tokenUsage.totalTokens > 0 && (
            <div className="ml-4 px-3 py-1 bg-slate-50 border border-slate-200/50 rounded-lg flex items-center space-x-2">
              <svg
                className="w-3.5 h-3.5 text-apple-subtext"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-xs font-medium text-apple-subtext">
                {tokenUsage.totalTokens.toLocaleString()} tokens
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
              JSON.stringify(data, null, 2),
            )}`;
            const link = document.createElement("a");
            link.href = jsonString;
            link.download = "purchase_orders.json";
            link.click();
          }}
          className="flex items-center space-x-2 text-sm text-white bg-apple-blue hover:bg-apple-blueHover active:scale-[0.98] py-2.5 px-5 rounded-full font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span>Export JSON</span>
        </button>
      </div>

      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="min-w-full divide-y divide-slate-100 table-fixed">
          <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              {[
                { label: "Source", width: "w-24" },
                { label: "PO #", width: "w-32" },
                { label: "Customer", width: "w-48" },
                { label: "Sold To", width: "w-32" },
                { label: "Ship To", width: "w-32" },
                { label: "Material / Part #", width: "w-40" },
                { label: "Qty", width: "w-24" },
                { label: "Unit", width: "w-20" },
                { label: "Date", width: "w-32" },
                { label: "Address", width: "w-64" },
              ].map((header) => (
                <th
                  key={header.label}
                  scope="col"
                  className={`px-4 py-4 text-left text-[11px] font-semibold text-apple-subtext uppercase tracking-widest ${header.width}`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white/40 divide-y divide-slate-100">
            {data.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-blue-50/30 transition-colors group"
              >
                <td className="px-4 py-4 align-top">
                  <div className="text-[10px] text-apple-subtext font-mono break-all leading-tight border-l-2 border-transparent group-hover:border-apple-blue pl-2 transition-colors">
                    {row.sourceUrl ? (
                      <a
                        href={row.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-apple-blue hover:underline cursor-pointer transition-colors"
                      >
                        {row.sourceFile || "-"}
                      </a>
                    ) : (
                      row.sourceFile || "-"
                    )}
                  </div>
                </td>

                {/* Editable PO Number */}
                <td className="px-2 py-3 align-top">
                  <input
                    type="text"
                    value={row.purchaseOrderNumber}
                    onChange={(e) =>
                      onUpdate(index, "purchaseOrderNumber", e.target.value)
                    }
                    className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-apple-blue focus:ring-1 focus:ring-apple-blue/20 rounded-lg px-2 py-1.5 text-sm font-semibold text-apple-text transition-all"
                  />
                </td>

                {/* Editable Customer Name */}
                <td className="px-2 py-3 align-top">
                  <textarea
                    rows={1}
                    value={row.customerName}
                    onChange={(e) =>
                      onUpdate(index, "customerName", e.target.value)
                    }
                    className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-apple-blue focus:ring-1 focus:ring-apple-blue/20 rounded-lg px-2 py-1.5 text-sm text-apple-text transition-all resize-none overflow-hidden leading-relaxed"
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = target.scrollHeight + "px";
                    }}
                  />
                </td>

                {/* Editable Sold To */}
                <td className="px-2 py-3 align-top">
                  <input
                    type="text"
                    value={row.soldTo || ""}
                    onChange={(e) => onUpdate(index, "soldTo", e.target.value)}
                    className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-apple-blue focus:ring-1 focus:ring-apple-blue/20 rounded-lg px-2 py-1.5 text-sm text-apple-text font-mono transition-all"
                    placeholder="-"
                  />
                </td>

                {/* Editable Ship To */}
                <td className="px-2 py-3 align-top">
                  <input
                    type="text"
                    value={row.shipTo || ""}
                    onChange={(e) => onUpdate(index, "shipTo", e.target.value)}
                    className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-apple-blue focus:ring-1 focus:ring-apple-blue/20 rounded-lg px-2 py-1.5 text-sm text-apple-text font-mono transition-all"
                    placeholder="-"
                  />
                </td>

                {/* Editable Material Number */}
                <td className="px-2 py-3 align-top">
                  <input
                    type="text"
                    value={row.materialNumber}
                    onChange={(e) =>
                      onUpdate(index, "materialNumber", e.target.value)
                    }
                    className="w-full bg-slate-50/50 border border-transparent hover:border-slate-200 focus:border-apple-blue focus:ring-1 focus:ring-apple-blue/20 rounded-lg px-2 py-1.5 text-sm text-slate-600 font-mono transition-all"
                  />
                </td>

                {/* Editable Quantity */}
                <td className="px-2 py-3 align-top">
                  <input
                    type="text"
                    value={row.orderQuantity}
                    onChange={(e) =>
                      onUpdate(index, "orderQuantity", e.target.value)
                    }
                    className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-apple-blue focus:ring-1 focus:ring-apple-blue/20 rounded-lg px-2 py-1.5 text-sm font-bold text-apple-text transition-all text-right pr-4"
                  />
                </td>

                {/* Editable Unit */}
                <td className="px-2 py-3 align-top">
                  <input
                    type="text"
                    value={row.unitOfMeasure}
                    onChange={(e) =>
                      onUpdate(index, "unitOfMeasure", e.target.value)
                    }
                    className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-apple-blue focus:ring-1 focus:ring-apple-blue/20 rounded-lg px-2 py-1.5 text-xs font-semibold text-apple-subtext uppercase transition-all"
                  />
                </td>

                {/* Editable Date */}
                <td className="px-2 py-3 align-top">
                  <input
                    type="text"
                    value={row.requiredDeliveryDate}
                    onChange={(e) =>
                      onUpdate(index, "requiredDeliveryDate", e.target.value)
                    }
                    className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-apple-blue focus:ring-1 focus:ring-apple-blue/20 rounded-lg px-2 py-1.5 text-sm text-apple-text transition-all whitespace-nowrap"
                  />
                </td>

                {/* Address (Read Only) */}
                <td className="px-4 py-4 text-xs text-apple-subtext break-words leading-relaxed align-top">
                  {row.deliveryAddress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
