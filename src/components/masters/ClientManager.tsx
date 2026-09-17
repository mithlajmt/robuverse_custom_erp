"use client";

import React, { useState, useEffect } from "react";
import { Client } from "@/types/document";
import { DocumentStorageService } from "@/lib/storage/documentStorage";

export default function ClientManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Partial<Client> | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    setClients(DocumentStorageService.getClients());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient?.orgName) return;

    DocumentStorageService.saveClient({
      id: selectedClient.id,
      name: selectedClient.name || selectedClient.orgName,
      orgName: selectedClient.orgName,
      gstin: selectedClient.gstin || "",
      address: selectedClient.address || "",
      phone: selectedClient.phone || "",
      email: selectedClient.email || "",
      state: selectedClient.state || "Kerala",
    });

    setIsEditing(false);
    setSelectedClient(null);
    loadClients();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this client profile?")) {
      DocumentStorageService.deleteClient(id);
      loadClients();
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.gstin && c.gstin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>👥</span> Client Directory (CRM)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Save and manage client company profiles, billing addresses, and GSTIN details for 1-click document auto-fill.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedClient({ orgName: "", gstin: "", address: "", state: "Kerala" });
            setIsEditing(true);
          }}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition-all flex items-center space-x-2"
        >
          <span>+ Add New Client</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search clients by organization name, GSTIN, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-full"
        />
      </div>

      {/* Client List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 transition-all shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm text-slate-100 line-clamp-1">{client.orgName}</h3>
                {client.gstin && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                    GSTIN
                  </span>
                )}
              </div>
              {client.gstin && (
                <p className="text-xs font-mono text-cyan-400 mt-1 font-medium">{client.gstin}</p>
              )}
              <p className="text-xs text-slate-400 mt-3 line-clamp-3 whitespace-pre-line leading-relaxed">
                {client.address}
              </p>
              {client.phone && <p className="text-xs text-slate-400 mt-2 font-mono">📞 {client.phone}</p>}
              {client.email && <p className="text-xs text-slate-400 mt-0.5">✉️ {client.email}</p>}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 mt-4 border-t border-slate-800/80">
              <button
                onClick={() => {
                  setSelectedClient(client);
                  setIsEditing(true);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
              >
                Edit Profile
              </button>
              <button
                onClick={() => handleDelete(client.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/40 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Edit / Create */}
      {isEditing && selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">
              {selectedClient.id ? "Edit Client Profile" : "Add New Client"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Organization / Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CONFEDERATION OF RENEWABLE ENERGY"
                  value={selectedClient.orgName || ""}
                  onChange={(e) => setSelectedClient({ ...selectedClient, orgName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Client GSTIN Number</label>
                <input
                  type="text"
                  placeholder="e.g. 32AAEAC6254D1Z7"
                  value={selectedClient.gstin || ""}
                  onChange={(e) => setSelectedClient({ ...selectedClient, gstin: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Billing Address *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Street, City, State, Pincode"
                  value={selectedClient.address || ""}
                  onChange={(e) => setSelectedClient({ ...selectedClient, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98470XXXXX"
                    value={selectedClient.phone || ""}
                    onChange={(e) => setSelectedClient({ ...selectedClient, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Email</label>
                  <input
                    type="email"
                    placeholder="contact@client.org"
                    value={selectedClient.email || ""}
                    onChange={(e) => setSelectedClient({ ...selectedClient, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all shadow"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
