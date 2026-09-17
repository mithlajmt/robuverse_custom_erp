"use client";

import React, { useState, useEffect } from "react";
import DocumentForm from "@/components/documents/DocumentForm";
import DocumentPreview from "@/components/documents/DocumentPreview";
import DocumentHistory from "@/components/documents/DocumentHistory";
import ClientManager from "@/components/masters/ClientManager";
import ProductCatalogManager from "@/components/masters/ProductCatalogManager";
import SettingsManager from "@/components/masters/SettingsManager";
import { BusinessDocument, CompanySettings } from "@/types/document";
import { DocumentStorageService } from "@/lib/storage/documentStorage";
import { FileText, PlusCircle, History, Users, Package, Settings, Plus } from "lucide-react";

export default function DocumentsStudioPage() {
  const [activeTab, setActiveTab] = useState<
    "create" | "history" | "clients" | "products" | "settings"
  >("history");

  const [settings, setSettings] = useState<CompanySettings>(DocumentStorageService.getSettings());
  const [editingDoc, setEditingDoc] = useState<BusinessDocument | undefined>(undefined);
  const [previewDoc, setPreviewDoc] = useState<BusinessDocument | null>(null);

  useEffect(() => {
    setSettings(DocumentStorageService.getSettings());
  }, [activeTab]);

  const handleNewDocument = () => {
    setEditingDoc(undefined);
    setActiveTab("create");
  };

  const handleEditDocument = (doc: BusinessDocument) => {
    setEditingDoc(doc);
    setActiveTab("create");
  };

  const handleViewDocument = (doc: BusinessDocument) => {
    setEditingDoc(doc);
    setPreviewDoc(doc);
    setActiveTab("create");
  };

  const handleSaveSuccess = (savedDoc: BusinessDocument) => {
    setEditingDoc(savedDoc);
    alert(`Document ${savedDoc.docNumber} saved successfully!`);
    setActiveTab("history");
  };

  return (
    <div className="space-y-6">
      {/* Top Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
            <FileText className="h-7 w-7 text-cyan-400" />
            <span>Document Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, issue, preview, and archive GST Invoices, Quotations, Proforma Invoices & Challans.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleNewDocument}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>New Document</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 w-fit backdrop-blur shadow-lg">
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <History className="h-4 w-4" />
          <span>Repository / History</span>
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "create"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <PlusCircle className="h-4 w-4" />
          <span>{editingDoc ? `Edit ${editingDoc.docNumber}` : "Create / Edit"}</span>
        </button>
        <button
          onClick={() => setActiveTab("clients")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "clients"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Clients CRM</span>
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "products"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Product Catalog</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "settings"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Company & Bank Settings</span>
        </button>
      </div>

      {/* Main Workspace View */}
      {activeTab === "create" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-7xl mx-auto">
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <span>✏️</span>
                <span>{editingDoc ? `Edit Document (${editingDoc.docNumber})` : "New Business Document"}</span>
              </h2>
              <button
                onClick={() => setActiveTab("history")}
                className="text-xs text-slate-400 hover:text-cyan-400 underline cursor-pointer"
              >
                Back to Repository
              </button>
            </div>
            <DocumentForm
              initialDocument={editingDoc}
              settings={settings}
              onSaveSuccess={handleSaveSuccess}
              onPreviewUpdate={setPreviewDoc}
            />
          </div>

          <div className="lg:col-span-6 sticky top-20">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live A4 Print Preview
              </h2>
            </div>
            {previewDoc ? (
              <DocumentPreview document={previewDoc} settings={settings} scale={0.72} />
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                Preview loading...
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <DocumentHistory
          onEditDocument={handleEditDocument}
          onViewDocument={handleViewDocument}
        />
      )}

      {activeTab === "clients" && <ClientManager />}

      {activeTab === "products" && <ProductCatalogManager />}

      {activeTab === "settings" && <SettingsManager />}
    </div>
  );
}
