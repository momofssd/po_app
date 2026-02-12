import React, { useState, useEffect, useRef } from 'react';
import { Customer } from '../types';
import { customerService } from '../services/customerService';

export const CustomerSelector: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        const data = await customerService.searchCustomers(query);
        setResults(data);
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setQuery('');
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    setQuery('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Customer Master
      </h2>

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="relative">
            <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            placeholder="Search by ID or Name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!!selectedCustomer}
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {isSearching && (
                 <div className="absolute right-3 top-3">
                    <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                 </div>
            )}
            {selectedCustomer && (
                 <button onClick={handleClear} className="absolute right-2 top-2 p-1 text-slate-400 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
            )}
        </div>

        {/* Dropdown Results */}
        {showDropdown && results.length > 0 && !selectedCustomer && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-slate-100 max-h-60 overflow-y-auto">
            {results.map((customer) => (
                <button
                key={customer._id}
                onClick={() => handleSelect(customer)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors group"
                >
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">{customer.customer_names[0]}</p>
                        <p className="text-xs text-slate-500 mt-0.5">ID: <span className="font-mono text-indigo-600">{customer.customer_id}</span></p>
                    </div>
                </div>
                </button>
            ))}
            </div>
        )}
      </div>

      {/* Selected Customer Details */}
      {selectedCustomer ? (
        <div className="space-y-4 animate-fade-in">
            {/* Sales Org Card */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100/50">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Sales Organization</p>
                <div className="flex items-center">
                    <span className="text-2xl font-bold text-indigo-900">{selectedCustomer.sales_org}</span>
                    <div className="ml-auto bg-white px-2 py-1 rounded text-xs font-mono text-indigo-600 border border-indigo-100">Active</div>
                </div>
            </div>

            {/* Ship To List */}
            <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ship To Addresses</p>
                 <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                    <ul className="divide-y divide-slate-100">
                        {selectedCustomer.ship_to && Object.entries(selectedCustomer.ship_to).map(([id, address]) => (
                            <li key={id} className="p-3 hover:bg-white transition-colors">
                                <div className="flex items-start space-x-3">
                                    <div className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-500 mt-0.5 shadow-sm">
                                        {id}
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        {address}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                 </div>
            </div>
        </div>
      ) : (
          <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
              <p className="text-xs text-slate-400">Search to view Customer Master data</p>
          </div>
      )}
    </div>
  );
};