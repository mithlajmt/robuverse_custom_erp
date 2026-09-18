"use client";

import React, { useState, useEffect } from "react";
import { BusinessDocument, DocType } from "@/types/document";
import { DocumentStorageService } from "@/lib/storage/documentStorage";
import { formatCurrency } from "@/lib/utils/currency";
import { getDocumentsAction, deleteDocumentAction } from "@/lib/actions/documents";

interface DocumentHistoryProps {
  onEditDocument: (doc: BusinessDocument) => void;
  onViewDocument: (doc: BusinessDocument) => void;
}

export default function DocumentHistory({ onEditDocument, onViewDocument }: DocumentHistoryProps) {
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

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
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocumentAction(id);
      } catch (e) {
        console.error("DB Delete error:", e);
      }
      DocumentStorageService.deleteDocument(id);
      loadDocuments();
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
            Search, manage, convert, and export company Tax Invoices, Proforma Invoices, Quotations, and Letterheads.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by Ref # or Client Organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-full md:w-80 font-medium"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto">
          {["ALL", "PROFORMA", "TAX_INVOICE", "QUOTATION", "LETTERHEAD"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedType === type
                  ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {type.replace("_", " ")}
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
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead className="bg-slate-50/70 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="p-4">Ref Number & Type</th>
                <th className="p-4">Recipient / Client</th>
                <th className="p-4">Date</th>
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
                  <td className="p-4 text-right space-x-2">
                    {/* One-Click Conversion Buttons */}
                    {doc.docType === "QUOTATION" && (
                      <button
                        onClick={() => handleConvert(doc.id, "PROFORMA")}
                        className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold hover:bg-amber-100 transition cursor-pointer"
                        title="Convert Quotation to Proforma Invoice"
                      >
                        ⚡ Convert to PI
                      </button>
                    )}
                    {doc.docType === "PROFORMA" && (
                      <button
                        onClick={() => handleConvert(doc.id, "TAX_INVOICE")}
                        className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold hover:bg-emerald-100 transition cursor-pointer"
                        title="Convert PI to Tax Invoice"
                      >
                        ⚡ Convert to Invoice
                      </button>
                    )}

                    <button
                      onClick={() => onViewDocument(doc)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition cursor-pointer"
                    >
                      View / PDF
                    </button>
                    <button
                      onClick={() => onEditDocument(doc)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
