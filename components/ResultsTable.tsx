import React from "react";
import { PurchaseOrderLine } from "../types";

interface ResultsTableProps {
  data: PurchaseOrderLine[];
  onUpdate: (index: number, field: keyof PurchaseOrderLine, value: any) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  onUpdate,
}) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
        <p className="font-medium">No extracted data to display</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-100 flex flex-col h-full">
      <div className="px-8 py-5 border-b border-slate-100 bg-white flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
          <h3 className="text-lg font-bold text-slate-800">
            Extracted Line Items{" "}
            <span className="ml-2 text-xs py-1 px-2.5 bg-indigo-50 text-indigo-600 rounded-full">
              {data.length}
            </span>
          </h3>
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
          className="flex items-center space-x-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 py-2 px-4 rounded-lg font-medium shadow-md shadow-indigo-200 transition-all"
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
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              {[
                { label: "Source", width: "w-20" },
                { label: "PO #", width: "w-28" },
                { label: "Customer", width: "w-40" },
                { label: "Sold To", width: "w-32" },
                { label: "Ship To", width: "w-32" },
                { label: "Material / Part #", width: "w-36" },
                { label: "Qty", width: "w-20" },
                { label: "Unit", width: "w-16" },
                { label: "Date", width: "w-28" },
                { label: "Address", width: "w-64" },
              ].map((header) => (
                <th
                  key={header.label}
                  scope="col"
                  className={`px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${header.width}`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {data.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-indigo-50/30 transition-colors group"
              >
                <td
                  className="px-2 py-4 text-[10px] text-slate-400 font-mono whitespace-normal break-all leading-tight border-l-2 border-transparent group-hover:border-indigo-500"
                  title={row.sourceFile}
                >
                  {row.sourceUrl ? (
                    <a
                      href={row.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-600 hover:underline cursor-pointer"
                    >
                      {row.sourceFile || "-"}
                    </a>
                  ) : (
                    row.sourceFile || "-"
                  )}
                </td>

                {/* Editable PO Number */}
                <td className="px-2 py-3">
                  <input
                    type="text"
                    value={row.purchaseOrderNumber}
                    onChange={(e) =>
                      onUpdate(index, "purchaseOrderNumber", e.target.value)
                    }
                    className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 text-sm font-semibold text-slate-700 transition-all"
                  />
                </td>

                {/* Editable Customer Name */}
                <td className="px-2 py-3">
                  <textarea
                    rows={1}
                    value={row.customerName}
                    onChange={(e) =>
                      onUpdate(index, "customerName", e.target.value)
                    }
                    className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 text-sm text-slate-600 transition-all resize-none overflow-hidden"
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = target.scrollHeight + "px";
                    }}
                  />
                </td>

                {/* Editable Sold To */}
                <td className="px-2 py-3">
                  <input
                    type="text"
                    value={row.soldTo || ""}
                    onChange={(e) => onUpdate(index, "soldTo", e.target.value)}
                    className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 text-sm text-slate-600 transition-all"
                  />
                </td>

                {/* Editable Ship To */}
                <td className="px-2 py-3">
                  <input
                    type="text"
                    value={row.shipTo || ""}
                    onChange={(e) => onUpdate(index, "shipTo", e.target.value)}
                    className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 text-sm text-slate-600 transition-all"
                  />
                </td>

                {/* Editable Material Number */}
                <td className="px-2 py-3">
                  <input
                    type="text"
                    value={row.materialNumber}
                    onChange={(e) =>
                      onUpdate(index, "materialNumber", e.target.value)
                    }
                    className="w-full bg-slate-50/50 border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 text-sm text-slate-500 font-mono transition-all"
                  />
                </td>

                {/* Editable Quantity */}
                <td className="px-2 py-3">
                  <input
                    type="text"
                    value={row.orderQuantity}
                    onChange={(e) =>
                      onUpdate(index, "orderQuantity", e.target.value)
                    }
                    className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 text-sm font-bold text-slate-900 transition-all"
                  />
                </td>

                {/* Editable Unit */}
                <td className="px-2 py-3">
                  <input
                    type="text"
                    value={row.unitOfMeasure}
                    onChange={(e) =>
                      onUpdate(index, "unitOfMeasure", e.target.value)
                    }
                    className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 text-xs font-medium text-slate-500 uppercase transition-all"
                  />
                </td>

                {/* Editable Date */}
                <td className="px-2 py-3">
                  <input
                    type="text"
                    value={row.requiredDeliveryDate}
                    onChange={(e) =>
                      onUpdate(index, "requiredDeliveryDate", e.target.value)
                    }
                    className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 text-sm text-slate-600 transition-all whitespace-nowrap"
                  />
                </td>

                {/* Address (Read Only) */}
                <td className="px-4 py-4 text-sm text-slate-500 break-words leading-snug">
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
