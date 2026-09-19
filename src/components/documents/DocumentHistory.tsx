"use client";

import React, { useState, useEffect } from "react";
import { BusinessDocument, DocType, CompanySettings } from "@/types/document";
import { DocumentStorageService } from "@/lib/storage/documentStorage";
import { formatCurrency } from "@/lib/utils/currency";
import { getDocumentsAction, deleteDocumentAction, duplicateDocumentAction } from "@/lib/actions/documents";
import DocumentPreview from "@/components/documents/DocumentPreview";
import { X, Copy, Eye, Edit3, Trash2, Search, Filter } from "lucide-react";

interface DocumentHistoryProps {
  onEditDocument: (doc: BusinessDocument) => void;
  onViewDocument: (doc: BusinessDocument) => void;
  settings?: CompanySettings;
}

export default function DocumentHistory({ onEditDocument, onViewDocument, settings }: DocumentHistoryProps) {
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [previewModalDoc, setPreviewModalDoc] = useState<BusinessDocument | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  const activeSettings = settings || DocumentStorageService.getSettings();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const dbDocs = await getDocumentsAction();
      if (dbDocs && dbDocs.length > 0) {
        setDocuments(dbDocs);
        return;
      }
    } catch (e) {
      console.error("Could not fetch documents from DB:", e);
    }
    setDocuments(DocumentStorageService.getDocuments());
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this document from the database?")) {
      try {
        await deleteDocumentAction(id);
      } catch (e) {
        console.error("DB Delete error:", e);
      }
      DocumentStorageService.deleteDocument(id);
      loadDocuments();
      if (previewModalDoc?.id === id) setPreviewModalDoc(null);
    }
  };

  const handleDuplicate = async (doc: BusinessDocument) => {
    setIsDuplicating(doc.id);
    try {
      const res = await duplicateDocumentAction(doc.id);
      if (res.success && res.document) {
        alert(`Document duplicated successfully as ${res.document.docNumber}! Opening editor...`);
        await loadDocuments();
        onEditDocument(res.document);
      }
    } catch (err) {
      console.error("Duplicate error:", err);
      alert("Failed to duplicate document. Please try again.");
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleConvert = (docId: string, targetType: DocType) => {
    let advancePercent = 50;
    if (targetType === "PROFORMA") {
      const input = prompt("Enter Advance Payment Percentage for Proforma Invoice (e.g. 50, 30, 25, 70, 100):", "50");
      if (input !== null) {
        const parsed = parseFloat(input);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
          advancePercent = parsed;
        }
      }
    }

    const converted = DocumentStorageService.convertDocument(docId, targetType, advancePercent);
    if (converted) {
      alert(`Document converted successfully to ${targetType} (${advancePercent}% advance)! New Ref #: ${converted.docNumber}`);
      loadDocuments();
      onEditDocument(converted);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.recipientOrg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.recipientName && doc.recipientName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === "ALL" || doc.docType === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span>📋</span> Company Document Repository
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Search, manage, convert, and preview GST Invoices, Proforma Invoices, Quotations, and Non-GST Bills with 100% fidelity.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by Ref #, Client Org, or Contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-full md:w-80 font-medium"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto">
          {["ALL", "TAX_INVOICE", "NON_GST_INVOICE", "PROFORMA", "QUOTATION", "LETTERHEAD"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedType === type
                  ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {type === "TAX_INVOICE"
                ? "GST Invoice"
                : type === "NON_GST_INVOICE"
                ? "Non-GST Bill"
                : type.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 shadow-sm">
          <p className="text-base font-extrabold text-slate-900">No documents found</p>
          <p className="text-xs text-slate-500 mt-1">Create a new document to start managing company records.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse min-w-[750px]">
            <thead className="bg-slate-50/70 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="p-4">Ref Number & Type</th>
                <th className="p-4">Billing Mode</th>
                <th className="p-4">Recipient / Client</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4">Grand Total (₹)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-900">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-indigo-50/30 transition">
                  <td className="p-4">
                    <p className="font-mono font-extrabold text-indigo-700">{doc.docNumber}</p>
                    <span className="text-[10px] font-bold text-slate-500">{doc.docType.replace("_", " ")}</span>
                  </td>
                  <td className="p-4">
                    {doc.isGstBill !== false && doc.docType !== "NON_GST_INVOICE" ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[9.5px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                        GST Bill
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 font-extrabold text-[9.5px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Non-GST
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="font-extrabold text-slate-900">{doc.recipientOrg}</p>
                    {doc.recipientName && doc.recipientName !== doc.recipientOrg && (
                      <p className="text-[11px] text-slate-500 font-medium">{doc.recipientName}</p>
                    )}
                  </td>
                  <td className="p-4 text-slate-600 font-mono text-xs">{doc.date}</td>
                  <td className="p-4 font-mono font-extrabold text-emerald-700 text-sm">
                    {formatCurrency(doc.grandTotal)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase ${
                        doc.status === "PAID"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : doc.status === "ISSUED"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5">
                    {/* One-Click Conversion Buttons */}
                    {doc.docType === "QUOTATION" && (
                      <button
                        onClick={() => handleConvert(doc.id, "PROFORMA")}
                        className="px-2 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold hover:bg-amber-100 transition cursor-pointer"
                        title="Convert Quotation to Proforma Invoice"
                      >
                        ⚡ To PI
                      </button>
                    )}
                    {doc.docType === "PROFORMA" && (
                      <button
                        onClick={() => handleConvert(doc.id, "TAX_INVOICE")}
                        className="px-2 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold hover:bg-emerald-100 transition cursor-pointer"
                        title="Convert PI to Tax Invoice"
                      >
                        ⚡ To Tax Inv
                      </button>
                    )}

                    {/* Instant Preview Modal Button */}
                    <button
                      onClick={() => setPreviewModalDoc(doc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition cursor-pointer"
                      title="Quick Preview / Print / PDF"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    {/* Duplicate Action Button */}
                    <button
                      onClick={() => handleDuplicate(doc)}
                      disabled={isDuplicating === doc.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition cursor-pointer"
                      title="Duplicate Document into new draft"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isDuplicating === doc.id ? "..." : "Copy"}</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => onEditDocument(doc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                      title="Edit in Document Studio"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QUICK PREVIEW POPUP MODAL */}
      {previewModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center space-x-3">
                <span className="font-mono font-extrabold text-indigo-700 text-base">
                  {previewModalDoc.docNumber}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-bold text-slate-700">
                  {previewModalDoc.recipientOrg}
                </span>
                {previewModalDoc.isGstBill !== false ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                    GST Bill
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                    Non-GST
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const d = previewModalDoc;
                    setPreviewModalDoc(null);
                    onEditDocument(d);
                  }}
                  className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Open in Editor</span>
                </button>
                <button
                  onClick={() => setPreviewModalDoc(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Preview */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100/60 flex justify-center">
              <div className="w-full max-w-[210mm]">
                <DocumentPreview document={previewModalDoc} settings={activeSettings} scale={0.78} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
