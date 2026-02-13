import React, { useEffect, useState } from "react";
import { customerService } from "../services/customerService";
import { Customer } from "../types";

interface CustomerMasterProps {
  onBack: () => void;
}

export const CustomerMaster: React.FC<CustomerMasterProps> = ({ onBack }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formData, setFormData] = useState<Partial<Customer>>({
    customer_id: "",
    customer_names: [""],
    sales_org: "",
    ship_to: {},
  });

  const [newShipToId, setNewShipToId] = useState("");
  const [newShipToAddress, setNewShipToAddress] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await customerService.getAllCustomers();
      setCustomers(data);
    } catch (err) {
      setError("Failed to fetch customers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer._id);
    setFormData({
      customer_id: customer.customer_id,
      customer_names: [...customer.customer_names],
      sales_org: customer.sales_org,
      ship_to: { ...customer.ship_to },
    });
    setIsAdding(false);
    setError(null);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      customer_id: "",
      customer_names: [""],
      sales_org: "",
      ship_to: {},
    });
    setError(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setError(null);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        const updated = await customerService.updateCustomer(
          editingId,
          formData,
        );
        setCustomers(customers.map((c) => (c._id === editingId ? updated : c)));
      } else {
        const created = await customerService.createCustomer(formData);
        setCustomers([...customers, created]);
      }
      handleCancel();
    } catch (err) {
      setError("Failed to save customer");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    try {
      await customerService.deleteCustomer(id);
      setCustomers(customers.filter((c) => c._id !== id));
    } catch (err) {
      setError("Failed to delete customer");
      console.error(err);
    }
  };

  const handleNameChange = (index: number, value: string) => {
    const names = [...(formData.customer_names || [])];
    names[index] = value;
    setFormData({ ...formData, customer_names: names });
  };

  const addNameField = () => {
    setFormData({
      ...formData,
      customer_names: [...(formData.customer_names || []), ""],
    });
  };

  const removeNameField = (index: number) => {
    const names = [...(formData.customer_names || [])];
    names.splice(index, 1);
    setFormData({ ...formData, customer_names: names });
  };

  const addShipTo = () => {
    if (!newShipToId || !newShipToAddress) return;
    setFormData({
      ...formData,
      ship_to: {
        ...(formData.ship_to || {}),
        [newShipToId]: newShipToAddress,
      },
    });
    setNewShipToId("");
    setNewShipToAddress("");
  };

  const removeShipTo = (id: string) => {
    const newShipTo = { ...(formData.ship_to || {}) };
    delete newShipTo[id];
    setFormData({ ...formData, ship_to: newShipTo });
  };

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    const matchesId = customer.customer_id.toLowerCase().includes(query);
    const matchesNames = customer.customer_names.some((name) =>
      name.toLowerCase().includes(query),
    );
    const matchesSalesOrg = customer.sales_org.toLowerCase().includes(query);
    const shipToCount = Object.keys(customer.ship_to || {}).length.toString();
    const matchesShipToCount = shipToCount.includes(query);

    return matchesId || matchesNames || matchesSalesOrg || matchesShipToCount;
  });

  if (loading && customers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={onBack}
            className="text-apple-blue hover:text-apple-blueHover text-sm font-medium flex items-center mb-2"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold text-apple-text">
            Customer Master
          </h2>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={handleAdd}
            className="bg-apple-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-apple-blueHover transition-colors"
          >
            Add New Customer
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      {!isAdding && !editingId && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, Name, Sales Org, or Ship To Count..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue sm:text-sm transition-all"
            />
          </div>
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold">
            {isAdding ? "Add New Customer" : "Edit Customer"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Customer ID
              </label>
              <input
                type="text"
                value={formData.customer_id}
                onChange={(e) =>
                  setFormData({ ...formData, customer_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
                placeholder="e.g. 10091054"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Sales Org
              </label>
              <input
                type="text"
                value={formData.sales_org}
                onChange={(e) =>
                  setFormData({ ...formData, sales_org: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
                placeholder="e.g. 7731"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Customer Names
            </label>
            <div className="space-y-2">
              {formData.customer_names?.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    className="flex-grow px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
                  />
                  {formData.customer_names!.length > 1 && (
                    <button
                      onClick={() => removeNameField(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addNameField}
                className="text-apple-blue text-sm font-medium hover:underline"
              >
                + Add Name Variant
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Ship To Locations
            </label>
            <div className="space-y-2 mb-3">
              {Object.entries(formData.ship_to || {}).map(([id, address]) => (
                <div
                  key={id}
                  className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg"
                >
                  <div className="flex-grow">
                    <span className="font-bold text-sm">{id}:</span>{" "}
                    <span className="text-sm">{address}</span>
                  </div>
                  <button
                    onClick={() => removeShipTo(id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-start">
              <input
                type="text"
                value={newShipToId}
                onChange={(e) => setNewShipToId(e.target.value)}
                placeholder="ID"
                className="w-24 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
              />
              <input
                type="text"
                value={newShipToAddress}
                onChange={(e) => setNewShipToAddress(e.target.value)}
                placeholder="Address"
                className="flex-grow px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
              />
              <button
                onClick={addShipTo}
                className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm hover:bg-slate-200"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-apple-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-apple-blueHover"
            >
              Save Customer
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Customer ID
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Names
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Sales Org
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Ship To Count
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {customer.customer_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {customer.customer_names.join(", ")}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {customer.sales_org}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {Object.keys(customer.ship_to || {}).length}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-apple-blue hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(customer._id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
