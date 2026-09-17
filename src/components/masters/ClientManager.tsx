"use client";

import { useState, useEffect } from "react";
import { DocumentStorageService } from "@/lib/storage/documentStorage";
import { Client as ClientRecord } from "@/types/document";

export function ClientManager() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Partial<ClientRecord> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setClients(DocumentStorageService.getClients());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient?.orgName) return;

    DocumentStorageService.saveClient({
      id: selectedClient.id || "",
      name: selectedClient.orgName,
      orgName: selectedClient.orgName,
      gstin: selectedClient.gstin || "",
      address: selectedClient.address || "",
      phone: selectedClient.phone || "",
      email: selectedClient.email || "",
    });

    setClients(DocumentStorageService.getClients());
    setIsEditing(false);
    setSelectedClient(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this client record?")) {
      DocumentStorageService.deleteClient(id);
      setClients(DocumentStorageService.getClients());
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.gstin || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Clients CRM Database</h1>
          <p className="text-xs text-slate-500 font-medium">Manage saved clients & organization profiles for quick autofill</p>
        </div>
        <button
          onClick={() => {
            setSelectedClient({});
            setIsEditing(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-indigo-500/20 transition cursor-pointer flex items-center space-x-2"
        >
          <span>+ Add New Client</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search clients by organization name, GSTIN, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-full font-medium"
        />
      </div>

      {/* Client List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-5 transition shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1">{client.orgName}</h3>
                {client.gstin && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                    GSTIN
                  </span>
                )}
              </div>
              {client.gstin && (
                <p className="text-xs font-mono text-indigo-700 mt-1 font-bold">{client.gstin}</p>
              )}
              <p className="text-xs text-slate-600 mt-3 line-clamp-3 whitespace-pre-line leading-relaxed font-medium">
                {client.address}
              </p>
              {client.phone && <p className="text-xs text-slate-500 mt-2 font-mono">📞 {client.phone}</p>}
              {client.email && <p className="text-xs text-slate-500 mt-0.5">✉️ {client.email}</p>}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedClient(client);
                  setIsEditing(true);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
              >
                Edit Profile
              </button>
              <button
                onClick={() => handleDelete(client.id)}
                className="text-xs px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Edit / Create */}
      {isEditing && selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              {selectedClient.id ? "Edit Client Profile" : "Add New Client"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-bold">Organization / Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CONFEDERATION OF RENEWABLE ENERGY"
                  value={selectedClient.orgName || ""}
                  onChange={(e) => setSelectedClient({ ...selectedClient, orgName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-bold">Client GSTIN Number</label>
                <input
                  type="text"
                  placeholder="32AAEAC6254D1Z7"
                  value={selectedClient.gstin || ""}
                  onChange={(e) => setSelectedClient({ ...selectedClient, gstin: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-bold">Billing Address</label>
                <textarea
                  rows={3}
                  placeholder="Building No, Street, City, State, Pincode"
                  value={selectedClient.address || ""}
                  onChange={(e) => setSelectedClient({ ...selectedClient, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-bold">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={selectedClient.phone || ""}
                    onChange={(e) => setSelectedClient({ ...selectedClient, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-bold">Email Address</label>
                  <input
                    type="email"
                    placeholder="contact@org.com"
                    value={selectedClient.email || ""}
                    onChange={(e) => setSelectedClient({ ...selectedClient, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer"
                >
                  Save Client Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientManager;
