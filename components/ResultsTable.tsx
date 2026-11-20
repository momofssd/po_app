import React from "react";
import { resultsService } from "../services/resultsService";
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
  const [isApiModalOpen, setIsApiModalOpen] = React.useState(false);
  const [apiUrl, setApiUrl] = React.useState("");
  const [apiToken, setApiToken] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [copyTokenSuccess, setCopyTokenSuccess] = React.useState(false);

  const handleApiClick = async () => {
    setIsSaving(true);
    try {
      await resultsService.saveResults(data);
      const url = resultsService.getResultsUrl();
      setApiUrl(url);

      // Extract token from URL if possible, otherwise get from service
      const urlObj = new URL(url);
      const token = urlObj.searchParams.get("wms_session_token") || "";
      setApiToken(token);

      setIsApiModalOpen(true);
      setCopySuccess(false);
      setCopyTokenSuccess(false);
    } catch (error) {
      console.error("Failed to save results:", error);
      alert("Failed to generate API URL. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(apiUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiToken);
    setCopyTokenSuccess(true);
    setTimeout(() => setCopyTokenSuccess(false), 2000);
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-center text-brand-subtext bg-white/50 rounded-3xl border border-dashed border-neutral-200/60 backdrop-blur-sm">
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
    <div className="w-full bg-white rounded-3xl shadow-brand border border-brand-border flex flex-col h-full overflow-hidden backdrop-blur-xl">
      <div className="px-8 py-6 border-b border-neutral-100 bg-white/80 flex justify-between items-center sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-1.5 bg-brand-primary rounded-full shadow-sm"></div>
          <h3 className="text-xl font-semibold text-brand-text tracking-tight">
            Extracted Line Items{" "}
            <span className="ml-3 text-xs py-1 px-2.5 bg-primary-50 text-brand-primary rounded-full font-medium border border-primary-100">
              {data.length}
            </span>
          </h3>
          {tokenUsage && tokenUsage.totalTokens > 0 && (
            <div className="ml-4 px-3 py-1 bg-neutral-50 border border-neutral-200/50 rounded-lg flex items-center space-x-2">
              <svg
                className="w-3.5 h-3.5 text-brand-subtext"
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
              <span className="text-xs font-medium text-brand-subtext">
                {tokenUsage.totalTokens.toLocaleString()} tokens
              </span>
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleApiClick}
            disabled={isSaving}
            className={`flex items-center space-x-2 text-sm text-brand-primary bg-primary-50 hover:bg-primary-100 active:scale-[0.98] py-2.5 px-5 rounded-full font-medium border border-primary-200 shadow-sm transition-all duration-200 ${
              isSaving ? "opacity-70 cursor-not-allowed" : ""
            }`}
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
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{isSaving ? "Generating..." : "API Restful"}</span>
          </button>
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
            className="flex items-center space-x-2 text-sm text-white bg-brand-primary hover:bg-brand-primaryHover active:scale-[0.98] py-2.5 px-5 rounded-full font-medium shadow-sm transition-all duration-200"
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
      </div>

      {isApiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-brand-border animate-fadeIn">
            <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <h3 className="text-lg font-semibold text-brand-text">
                API Restful URL
              </h3>
              <button
                onClick={() => setIsApiModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-sm text-neutral-600">
                Access the current table data via the RESTful API using the URL
                or the session token below.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-brand-subtext uppercase tracking-wider ml-1">
                  Full API URL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={apiUrl}
                    readOnly
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg py-3 pl-4 pr-12 text-sm text-neutral-700 font-mono focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-brand-primary transition-colors rounded-md hover:bg-primary-50"
                    title="Copy URL"
                  >
                    {copySuccess ? (
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-brand-subtext uppercase tracking-wider ml-1">
                  Session Token
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={apiToken}
                    readOnly
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg py-3 pl-4 pr-12 text-sm text-neutral-700 font-mono focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  />
                  <button
                    onClick={handleCopyToken}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-brand-primary transition-colors rounded-md hover:bg-primary-50"
                    title="Copy Token"
                  >
                    {copyTokenSuccess ? (
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => setIsApiModalOpen(false)}
                className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="min-w-full divide-y divide-neutral-100 table-fixed">
          <thead className="bg-neutral-50/80 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              {[
                { label: "Source", width: "w-24" },
                { label: "Sales Org", width: "w-32" },
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
                  className={`px-4 py-4 text-left text-[11px] font-semibold text-brand-subtext uppercase tracking-widest ${header.width}`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white/40 divide-y divide-neutral-100">
            {data.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-primary-50/30 transition-colors group"
              >
                <td className="px-4 py-4 align-top">
                  <div className="text-[10px] text-brand-subtext font-mono break-all leading-tight border-l-2 border-transparent group-hover:border-brand-primary pl-2 transition-colors">
                    {row.sourceUrl ? (
                      <a
                        href={row.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-brand-primary hover:underline cursor-pointer transition-colors"
                      >
                        {row.sourceFile || "-"}
                      </a>
                    ) : (
                      row.sourceFile || "-"
                    )}
                  </div>
                </td>

                {/* Editable Sales Org */}
                <td className="px-2 py-3 align-top">
                  <input
                    type="text"
                    value={row.salesOrg || ""}
                    onChange={(e) =>
                      onUpdate(index, "salesOrg", e.target.value)
                    }
                    className="w-full bg-transparent border border-transparent hover:border-neutral-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 rounded-lg px-2 py-1.5 text-sm text-brand-text font-mono transition-all"
                    placeholder="-"
                  />
                </td>

                {/* Editable PO Number */}
                <td className="px-2 py-3 align-top">
                  <input
                    type="text"
                    value={row.purchaseOrderNumber}
                    onChange={(e) =>
                      onUpdate(index, "purchaseOrderNumber", e.target.value)
                    }
                    className="w-full bg-transparent border border-transparent hover:border-neutral-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 rounded-lg px-2 py-1.5 text-sm font-semibold text-brand-text transition-all"
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
                    className="w-full bg-transparent border border-transparent hover:border-neutral-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 rounded-lg px-2 py-1.5 text-sm text-brand-text transition-all resize-none overflow-hidden leading-relaxed"
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
                    className="w-full bg-transparent border border-transparent hover:border-neutral-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 rounded-lg px-2 py-1.5 text-sm text-brand-text font-mono transition-all"
                    placeholder="-"
                  />
                </td>

                {/* Editable Ship To */}
                <td className="px-2 py-3 align-top">
                  <input
                    type="text"
                    value={row.shipTo || ""}
                    onChange={(e) => onUpdate(index, "shipTo", e.target.value)}
                    className="w-full bg-transparent border border-transparent hover:border-neutral-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 rounded-lg px-2 py-1.5 text-sm text-brand-text font-mono transition-all"
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
                    className="w-full bg-neutral-50/50 border border-transparent hover:border-neutral-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 rounded-lg px-2 py-1.5 text-sm text-neutral-600 font-mono transition-all"
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
                    className="w-full bg-transparent border border-transparent hover:border-neutral-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 rounded-lg px-2 py-1.5 text-sm font-bold text-brand-text transition-all text-right pr-4"
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
                    className="w-full bg-transparent border border-transparent hover:border-neutral-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 rounded-lg px-2 py-1.5 text-xs font-semibold text-brand-subtext uppercase transition-all"
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
                    className="w-full bg-transparent border border-transparent hover:border-neutral-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 rounded-lg px-2 py-1.5 text-sm text-brand-text transition-all whitespace-nowrap"
                  />
                </td>

                {/* Address (Read Only) */}
                <td className="px-4 py-4 text-xs text-brand-subtext break-words leading-relaxed align-top">
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
