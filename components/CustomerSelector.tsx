import React, { useEffect, useRef, useState } from "react";
import { customerService } from "../services/customerService";
import { Customer } from "../types";

export const CustomerSelector: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchCustomers = async (searchQuery: string) => {
    setIsSearching(true);
    const data = await customerService.searchCustomers(searchQuery);
    setResults(data);
    setIsSearching(false);
  };

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers(query);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setQuery("");
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    setQuery("");
    fetchCustomers(""); // Reset list
  };

  const toggleDropdown = () => {
    if (!selectedCustomer) {
      setShowDropdown(!showDropdown);
    }
  };

  return (
    <div
      className="bg-apple-card rounded-3xl shadow-apple border border-white/50 p-8 backdrop-blur-xl"
      ref={wrapperRef}
    >
      <h2 className="text-xl font-semibold text-apple-text mb-6 flex items-center tracking-tight">
        Customer Master
      </h2>

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-10 pr-10 py-3 bg-apple-bg/50 border border-slate-200/60 rounded-xl text-[15px] text-apple-text placeholder:text-apple-subtext focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue transition-all cursor-pointer"
            placeholder="Select or Search Customer..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onClick={() => setShowDropdown(true)}
            disabled={!!selectedCustomer}
          />
          <svg
            className="w-4 h-4 text-apple-subtext absolute left-3.5 top-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <div className="absolute right-3 top-3 flex items-center space-x-2">
            {isSearching ? (
              <svg
                className="animate-spin h-4 w-4 text-apple-subtext"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : selectedCustomer ? (
              <button
                onClick={handleClear}
                className="p-1 text-apple-subtext hover:text-red-500 transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            ) : (
              <button
                onClick={toggleDropdown}
                className="p-1 text-apple-subtext hover:text-apple-text transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Results */}
        {showDropdown && !selectedCustomer && (
          <div className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-xl rounded-xl shadow-apple-hover border border-slate-100 max-h-56 overflow-y-auto custom-scrollbar">
            {results.length > 0 ? (
              results.map((customer) => (
                <button
                  key={customer._id}
                  onClick={() => handleSelect(customer)}
                  className="w-full text-left px-4 py-3 hover:bg-apple-bg border-b border-slate-50 last:border-0 transition-colors group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[15px] font-medium text-apple-text">
                        {customer.customer_names[0]}
                      </p>
                      <p className="text-xs text-apple-subtext mt-0.5 font-medium">
                        ID:{" "}
                        <span className="font-mono text-apple-text">
                          {customer.customer_id}
                        </span>
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-4 text-sm text-apple-subtext text-center">
                No customers found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Customer Details */}
      {selectedCustomer ? (
        <div className="space-y-6 animate-fade-in">
          {/* Combined Customer Details Card */}
          <div className="bg-white/60 rounded-2xl p-6 border border-white/50 shadow-sm space-y-6 backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1 mr-4">
                <p className="text-[11px] font-semibold text-apple-subtext uppercase tracking-widest mb-1.5">
                  Customer Name
                </p>
                <h3 className="text-[15px] font-semibold text-apple-text leading-tight tracking-tight">
                  {selectedCustomer.customer_names[0]}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-apple-subtext uppercase tracking-widest mb-1.5">
                  Customer ID
                </p>
                <span className="font-mono text-apple-blue font-medium bg-blue-50/50 px-2.5 py-1 rounded-lg text-xs border border-blue-100/50">
                  {selectedCustomer.customer_id}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-apple-subtext uppercase tracking-widest mb-1.5">
                  Sales Organization
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-apple-text">
                    {selectedCustomer.sales_org}
                  </span>
                </div>
              </div>
              <div className="bg-green-50/80 px-3 py-1 rounded-full text-[11px] font-semibold text-green-700 border border-green-100/50 uppercase tracking-wide">
                Active
              </div>
            </div>
          </div>

          {/* Ship To List */}
          <div>
            <p className="text-[11px] font-semibold text-apple-subtext uppercase tracking-widest mb-3 pl-1">
              Ship To Addresses
            </p>
            <div className="bg-apple-bg/50 rounded-2xl border border-slate-200/60 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
              <ul className="divide-y divide-slate-100">
                {selectedCustomer.ship_to &&
                  Object.entries(selectedCustomer.ship_to).map(
                    ([id, address]) => (
                      <li
                        key={id}
                        className="p-4 hover:bg-white/60 transition-colors"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="bg-white border border-slate-200 px-2.5 py-1 rounded-md text-xs font-mono font-semibold text-apple-text mt-0.5 shadow-sm">
                            {id}
                          </div>
                          <p className="text-sm text-apple-text leading-relaxed font-light">
                            {address}
                          </p>
                        </div>
                      </li>
                    ),
                  )}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-slate-200/60 rounded-2xl bg-slate-50/30">
          <p className="text-sm text-apple-subtext font-medium">
            Search to view Customer Master data
          </p>
        </div>
      )}
    </div>
  );
};
