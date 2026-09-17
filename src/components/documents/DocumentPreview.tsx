"use client";

import React, { useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { BusinessDocument, CompanySettings } from "@/types/document";
import { numberToIndianWords } from "@/lib/utils/currency";

interface DocumentPreviewProps {
  document: BusinessDocument;
  settings: CompanySettings;
  scale?: number;
}

export default function DocumentPreview({ document: doc, settings, scale: initialScale = 0.75 }: DocumentPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [currentScale, setCurrentScale] = useState<number>(initialScale);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  const bankAccount = settings.bankAccounts.find((b) => b.id === doc.bankAccountId) || settings.bankAccounts[0];

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    setIsGeneratingPDF(true);
    try {
      // Temporarily remove transform on parent div during html2canvas render to avoid bounding rect scale calculation bugs
      const parentElement = element.parentElement;
      const originalTransform = parentElement ? parentElement.style.transform : "";

      if (parentElement) {
        parentElement.style.transform = "none";
      }

      // Wait 100ms for browser to re-layout at 1:1 unscaled size
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 3, // Ultra crisp High DPI density
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
      });

      // Restore scale transform
      if (parentElement) {
        parentElement.style.transform = originalTransform;
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
      pdf.save(`${doc.docType}_${doc.docNumber.replace(/[\/\\:]/g, "_")}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const cgstRate = (doc.taxRate || 18) / 2;
  const sgstRate = (doc.taxRate || 18) / 2;
  const cgstAmount = doc.cgstAmount ?? (doc.taxAmount / 2);
  const sgstAmount = doc.sgstAmount ?? (doc.taxAmount / 2);

  return (
    <div className="flex flex-col items-center w-full space-y-3">
      {/* Zoom & Download Toolbar */}
      <div className="flex items-center justify-between w-full max-w-[210mm] bg-slate-900/90 backdrop-blur p-2.5 rounded-xl border border-slate-800 text-xs shadow-lg no-print">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold text-cyan-400">{doc.docNumber}</span>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentScale((prev) => Math.max(0.4, prev - 0.1))}
              className="px-2 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 font-bold"
              title="Zoom Out"
            >
              -
            </button>
            <span className="text-[10px] font-mono text-slate-300 w-12 text-center">
              {Math.round(currentScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setCurrentScale((prev) => Math.min(1.2, prev + 0.1))}
              className="px-2 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 font-bold"
              title="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setCurrentScale(initialScale)}
              className="px-2 py-0.5 rounded text-[10px] text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Fit
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold px-3.5 py-1.5 rounded-lg shadow transition-all text-xs"
          >
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print / Save Vector PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold px-4 py-1.5 rounded-lg shadow-lg transition-all text-xs"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{isGeneratingPDF ? "Exporting PDF..." : "Download High-Res PDF"}</span>
          </button>
        </div>
      </div>

      {/* A4 Paper Canvas Container */}
      <div className="w-full flex justify-center overflow-x-auto p-1 max-h-[780px] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800/80 p-4 shadow-inner">
        <div
          style={{ transform: `scale(${currentScale})`, transformOrigin: "top center" }}
          className="transition-transform duration-200"
        >
          <div
            ref={printRef}
            id="a4-document-print-target"
            className="w-[210mm] min-h-[297mm] relative p-[14mm] flex flex-col justify-between overflow-hidden bg-white text-slate-800 font-sans shadow-2xl box-border leading-relaxed"
          >
            {/* Background Watermark */}
            {doc.showWatermark && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] z-0">
                <img src="/assets/logo.png" alt="Watermark Logo" className="w-[110mm] h-auto object-contain max-h-[140mm] grayscale" />
              </div>
            )}

            {/* Header Geometric Accent Strip (Navy & Gold) */}
            <div className="absolute top-0 left-0 w-full h-[3.5mm] flex z-10">
              <div className="flex-1 bg-indigo-950"></div>
              <div className="w-[50mm] bg-[#b08f57]"></div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 flex flex-col flex-1">
              {/* Header Banner */}
              <header className="flex flex-col items-center border-b border-[#b08f57]/30 pb-3 mb-3.5 pt-1">
                <div className="flex items-center gap-3.5 mb-1.5">
                  <img
                    src={settings.logoUrl || "/assets/logo.png"}
                    alt="Robuverse Logo"
                    className="h-16 w-auto object-contain"
                  />
                  <div className="flex flex-col">
                    <h1 className="font-cinzel text-[21px] font-bold tracking-[0.22em] text-indigo-950 leading-tight">
                      Robuverse. LLP
                    </h1>
                    <p className="text-[7.5px] font-semibold text-slate-500 uppercase tracking-[0.2em] mt-1 leading-normal">
                      Robotics • AI • Automation • Software • IoT • 3D Printing
                    </p>
                  </div>
                </div>
              </header>

              {/* Document Reference & Metadata Section */}
              <section className="flex justify-between items-start mb-3.5">
                <div className="text-[10px] text-slate-600 leading-relaxed space-y-1">
                  <div className="font-mono">
                    <span className="font-semibold uppercase tracking-wider text-slate-400">Ref:</span>{" "}
                    <span className="font-bold text-slate-800">{doc.docNumber}</span>
                  </div>
                  <div className="font-mono">
                    <span className="font-semibold uppercase tracking-wider text-slate-400">Date:</span> {doc.date}
                  </div>
                  {doc.dueDate && (
                    <div className="font-mono">
                      <span className="font-semibold uppercase tracking-wider text-slate-400">Due Date:</span> {doc.dueDate}
                    </div>
                  )}
                  {doc.showCompanyGst !== false && (
                    <div className="font-mono">
                      <span className="font-semibold uppercase tracking-wider text-slate-400">GSTIN:</span>{" "}
                      <span className="font-bold text-slate-800">{settings.gstin || "32ABOFR0193C1ZE"}</span>
                    </div>
                  )}
                  {doc.piReference && (
                    <div className="font-mono">
                      <span className="font-semibold uppercase tracking-wider text-slate-400">Against PI Ref:</span>{" "}
                      <span className="font-medium text-slate-800">{doc.piReference}</span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <h2 className="font-cinzel text-[13px] font-extrabold tracking-widest text-indigo-950 border-b-2 border-indigo-950/20 pb-0.5 inline-block uppercase leading-tight">
                    {doc.docType.replace("_", " ")}
                  </h2>
                  {doc.docSubtitle && (
                    <div className="text-[8px] font-bold text-indigo-900 max-w-[85mm] mt-1 font-sans leading-relaxed uppercase tracking-wider">
                      {doc.docSubtitle}
                    </div>
                  )}
                </div>
              </section>

              {/* Recipient Box */}
              {doc.showRecipientSection !== false && (
                <section className="mb-3.5 bg-slate-50/80 p-3 rounded-lg border border-slate-200">
                  <div className="text-[10.5px] leading-relaxed text-slate-700">
                    <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                      To:
                    </span>
                    {doc.recipientName && (
                      <div className="font-bold text-slate-800 text-[11.5px] tracking-wide mb-0.5">{doc.recipientName}</div>
                    )}
                    {doc.recipientOrg && (
                      <div className="font-semibold text-indigo-950 text-[11px] mb-1">{doc.recipientOrg}</div>
                    )}
                    {doc.recipientAddress && (
                      <div className="whitespace-pre-line text-slate-600 leading-relaxed text-[10px] mb-1">
                        {doc.recipientAddress}
                      </div>
                    )}
                    {doc.recipientGstin && (
                      <div className="font-mono text-[10px] font-bold text-slate-800">
                        GSTIN: {doc.recipientGstin}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Subject Line */}
              {doc.subject && (
                <section className="mb-3">
                  <h3 className="text-[10.5px] font-bold text-indigo-950 leading-relaxed flex gap-1.5">
                    <span className="underline decoration-slate-300 font-extrabold">SUBJECT:</span>
                    <span>{doc.subject}</span>
                  </h3>
                </section>
              )}

              {/* Body Text */}
              {doc.bodyText && (
                <p className="text-[10px] leading-relaxed text-slate-700 text-justify whitespace-pre-wrap mb-4">
                  {doc.bodyText}
                </p>
              )}

              {/* Line Items Table */}
              {(() => {
                const showSac = doc.showSacCode !== false;
                const showQty = doc.showQtyColumn !== false;
                const displayMode = doc.totalDisplayMode || (doc.showGstDetails === "hide" ? "total_only" : "full_breakdown");

                let colCount = 2; // # and Description
                if (showSac) colCount++;
                if (showQty) colCount++;
                const emptyColSpan = colCount - 1;

                return (
                  <section className="mb-4">
                    <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-indigo-950 text-white text-[9.5px] font-semibold uppercase tracking-wider leading-snug">
                            <th className="py-2.5 px-3 w-[7%] text-center">#</th>
                            <th className="py-2.5 px-3">{doc.colHeaderItem || "ITEM & DESCRIPTION"}</th>
                            {showSac && <th className="py-2.5 px-3 w-[12%] text-center">{doc.colHeaderSac || "SAC CODE"}</th>}
                            {showQty && <th className="py-2.5 px-3 w-[13%] text-center">{doc.colHeaderQty || doc.qtyColumnLabel || "QTY"}</th>}
                            <th className="py-2.5 px-3 w-[16%] text-right font-mono">{doc.colHeaderAmount || "AMOUNT"}</th>
                          </tr>
                        </thead>
                        <tbody className="text-[10px] text-slate-700 divide-y divide-slate-100 leading-relaxed">
                          {doc.items.map((item, idx) => (
                            <tr key={item.id || idx} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 text-center text-slate-400 font-medium font-mono">{idx + 1}</td>
                              <td className="py-2.5 px-3 font-medium text-slate-800 leading-relaxed">{item.description}</td>
                              {showSac && (
                                <td className="py-2.5 px-3 text-center font-mono text-slate-600">{item.sacCode || "998313"}</td>
                              )}
                              {showQty && (
                                <td className="py-2.5 px-3 text-center font-semibold font-mono">
                                  {(() => {
                                    const u = item.unit ? item.unit.trim() : "";
                                    if (!u || u.toLowerCase() === "none") return `${item.qty}`;
                                    if (item.qty === 1 && u.toLowerCase() === "days") return "1 Day";
                                    if (item.qty > 1 && u.toLowerCase() === "day") return `${item.qty} Days`;
                                    return `${item.qty} ${u}`;
                                  })()}
                                </td>
                              )}
                              <td className="py-2.5 px-3 text-right font-semibold font-mono text-slate-800">
                                ₹ {item.amount.toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))}

                          {/* Subtotal & GST Breakup based on totalDisplayMode */}
                          {displayMode === "full_breakdown" && (
                            <>
                              <tr className="bg-slate-50/40">
                                <td colSpan={emptyColSpan} className="border-t border-slate-200"></td>
                                <td className="py-2 px-3 text-right font-semibold text-slate-500 text-[9px] border-t border-slate-200 uppercase">
                                  Taxable Subtotal
                                </td>
                                <td className="py-2 px-3 text-right font-semibold font-mono text-slate-800 border-t border-slate-200">
                                  ₹ {doc.subtotal.toLocaleString("en-IN")}
                                </td>
                              </tr>

                              {doc.gstType === "intrastate" ? (
                                <>
                                  <tr className="bg-slate-50/40">
                                    <td colSpan={emptyColSpan}></td>
                                    <td className="py-1.5 px-3 text-right font-semibold text-slate-500 text-[9px] uppercase">
                                      CGST ({cgstRate}%)
                                    </td>
                                    <td className="py-1.5 px-3 text-right font-semibold font-mono text-slate-800">
                                      ₹ {cgstAmount.toLocaleString("en-IN")}
                                    </td>
                                  </tr>
                                  <tr className="bg-slate-50/40">
                                    <td colSpan={emptyColSpan}></td>
                                    <td className="py-1.5 px-3 text-right font-semibold text-slate-500 text-[9px] uppercase">
                                      SGST ({sgstRate}%)
                                    </td>
                                    <td className="py-1.5 px-3 text-right font-semibold font-mono text-slate-800">
                                      ₹ {sgstAmount.toLocaleString("en-IN")}
                                    </td>
                                  </tr>
                                </>
                              ) : (
                                <tr className="bg-slate-50/40">
                                  <td colSpan={emptyColSpan}></td>
                                  <td className="py-1.5 px-3 text-right font-semibold text-slate-500 text-[9px] uppercase">
                                    IGST ({doc.taxRate}%)
                                  </td>
                                  <td className="py-1.5 px-3 text-right font-semibold font-mono text-slate-800">
                                    ₹ {doc.taxAmount.toLocaleString("en-IN")}
                                  </td>
                                </tr>
                              )}

                              <tr className="bg-indigo-50/40 text-indigo-950 font-bold">
                                <td colSpan={emptyColSpan} className="border-t border-slate-200"></td>
                                <td className="py-2.5 px-3 text-right text-[10px] uppercase border-t border-slate-200">
                                  Total Invoice Value
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-[11.5px] border-t border-slate-200">
                                  ₹ {doc.grandTotal.toLocaleString("en-IN")}
                                </td>
                              </tr>
                            </>
                          )}

                          {displayMode === "subtotal_plus_tax" && (
                            <>
                              <tr className="bg-slate-50/40">
                                <td colSpan={emptyColSpan} className="border-t border-slate-200"></td>
                                <td className="py-2 px-3 text-right font-semibold text-slate-500 text-[9px] border-t border-slate-200 uppercase">
                                  Subtotal Amount
                                </td>
                                <td className="py-2 px-3 text-right font-semibold font-mono text-slate-800 border-t border-slate-200">
                                  ₹ {doc.subtotal.toLocaleString("en-IN")}
                                </td>
                              </tr>
                              <tr className="bg-slate-50/40">
                                <td colSpan={emptyColSpan}></td>
                                <td className="py-1.5 px-3 text-right font-semibold text-slate-500 text-[9px] uppercase">
                                  Total GST ({doc.taxRate}%)
                                </td>
                                <td className="py-1.5 px-3 text-right font-semibold font-mono text-slate-800">
                                  ₹ {doc.taxAmount.toLocaleString("en-IN")}
                                </td>
                              </tr>
                              <tr className="bg-indigo-50/40 text-indigo-950 font-bold">
                                <td colSpan={emptyColSpan} className="border-t border-slate-200"></td>
                                <td className="py-2.5 px-3 text-right text-[10px] uppercase border-t border-slate-200">
                                  Grand Total Amount
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-[11.5px] border-t border-slate-200">
                                  ₹ {doc.grandTotal.toLocaleString("en-IN")}
                                </td>
                              </tr>
                            </>
                          )}

                          {displayMode === "total_only" && (
                            <tr className="bg-indigo-950 text-white font-bold">
                              <td colSpan={emptyColSpan} className="border-t border-slate-200"></td>
                              <td className="py-3 px-3 text-right text-[10.5px] uppercase tracking-wider">
                                TOTAL AMOUNT PAYABLE
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-[12.5px] font-extrabold text-amber-300">
                                ₹ {doc.grandTotal.toLocaleString("en-IN")}
                              </td>
                            </tr>
                          )}

                          {displayMode === "no_tax_grand_total" && (
                            <tr className="bg-indigo-50/40 text-indigo-950 font-bold">
                              <td colSpan={emptyColSpan} className="border-t border-slate-200"></td>
                              <td className="py-2.5 px-3 text-right text-[10px] uppercase border-t border-slate-200">
                                Net Total Amount
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-[11.5px] border-t border-slate-200">
                                ₹ {doc.subtotal.toLocaleString("en-IN")}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                );
              })()}

              {/* Amount in Words */}
              <div className="mb-3 text-[9.5px] text-slate-700 bg-slate-50/90 p-2.5 rounded-lg border border-slate-200 flex flex-col gap-0.5 leading-relaxed">
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[8.5px]">
                    Amount in Words:{" "}
                  </span>
                  <span className="font-bold text-slate-900 italic text-[10px]">
                    {doc.amountInWords || numberToIndianWords(doc.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Zoho-Level 3-Card Advance Payment Breakdown for Proforma Invoices */}
              {doc.docType === "PROFORMA" && (
                <div className="mb-3.5 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-blue-50/80 border-l-4 border-indigo-900 border border-slate-200/80 p-2.5 rounded-r-lg shadow-sm font-sans">
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-indigo-950/10">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-950 text-[9px] uppercase tracking-wider">
                      <span className="bg-indigo-950 text-white text-[7px] px-1.5 py-0.5 rounded font-extrabold tracking-widest">
                        {doc.advancePercent || 50}% ADVANCE PROFORMA
                      </span>
                      <span>Contract Payment Breakdown</span>
                    </div>
                    <span className="text-[8.5px] font-semibold text-slate-500">
                      Ref: <span className="font-mono text-slate-800 font-bold">{doc.docNumber}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[8.5px]">
                    <div className="bg-white p-2 rounded border border-slate-200 flex flex-col justify-between">
                      <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wide">
                        Full Proposal Value
                      </span>
                      <span className="font-mono font-bold text-slate-800 text-[10.5px] mt-0.5">
                        ₹ {(doc.totalContractValue || (doc.advancePercent && doc.advancePercent > 0 ? Math.round(doc.grandTotal / (doc.advancePercent / 100)) : doc.grandTotal * 2)).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="bg-indigo-950 text-white p-2 rounded shadow-sm flex flex-col justify-between">
                      <span className="text-[7.5px] font-bold text-cyan-300 uppercase tracking-wide">
                        {doc.advancePercent || 50}% Payable Now (PI)
                      </span>
                      <span className="font-mono font-extrabold text-amber-300 text-[11px] mt-0.5">
                        ₹ {doc.grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded border border-slate-200 flex flex-col justify-between">
                      <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wide">
                        Balance Payable Later
                      </span>
                      <span className="font-mono font-bold text-slate-600 text-[10.5px] mt-0.5">
                        ₹ {Math.max(0, (doc.totalContractValue || (doc.advancePercent && doc.advancePercent > 0 ? Math.round(doc.grandTotal / (doc.advancePercent / 100)) : doc.grandTotal * 2)) - doc.grandTotal).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Terms & Bank Account Details */}
              <section className="grid grid-cols-2 gap-4 mb-3.5 text-[9px] leading-relaxed text-slate-600">
                {bankAccount && (
                  <div className="bg-slate-50/40 p-2.5 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-indigo-950 uppercase text-[8.5px] tracking-wider mb-1.5 border-b border-indigo-950/10 pb-1">
                      Payment Terms & Bank Details
                    </h4>
                    <div className="space-y-1.5">
                      <div className="bg-indigo-50/80 border-l-2 border-indigo-700 p-2 rounded text-[8.5px] font-medium text-indigo-950 leading-relaxed space-y-0.5">
                        <p><span className="font-bold">Beneficiary:</span> {bankAccount.accountName}</p>
                        <p><span className="font-bold">Bank:</span> {bankAccount.bankName} ({bankAccount.branch})</p>
                        <p><span className="font-bold">Account Number:</span> {bankAccount.accountNumber}</p>
                        <p><span className="font-bold">IFSC Code:</span> {bankAccount.ifsc}</p>
                        {bankAccount.upiId && <p><span className="font-bold">UPI / PhonePe:</span> {bankAccount.upiId}</p>}
                      </div>
                      {doc.showBankTransferNote !== false && (doc.bankAccountNote || bankAccount.note) && (
                        <div className="bg-amber-50/80 border-l-2 border-amber-500 px-2 py-1 rounded text-[8px] italic text-amber-950 font-medium leading-relaxed">
                          Note: {doc.bankAccountNote !== undefined ? doc.bankAccountNote : bankAccount.note}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {doc.validityNotes && (
                  <div className="bg-slate-50/40 p-2.5 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-indigo-950 uppercase text-[8.5px] tracking-wider mb-1.5 border-b border-indigo-950/10 pb-1">
                      Validity & Notes
                    </h4>
                    <p className="whitespace-pre-line leading-relaxed text-[9px]">
                      {doc.validityNotes}
                    </p>
                  </div>
                )}
              </section>

              {/* Signature Sign-Off & Official Seal */}
              <section className="flex justify-between items-end mt-auto pt-2 mb-2">
                {/* Official Stamp */}
                <div className="flex items-center select-none">
                  {doc.showSeal && (
                    <div className="relative w-[21mm] h-[21mm] flex items-center justify-center opacity-90">
                      <img src="/assets/digital_seal.png" alt="Robuverse Seal" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>

                {/* Digital Signature */}
                <div className="text-center">
                  <div className="text-[9.5px] font-bold text-indigo-950 tracking-wider mb-1 select-none">
                    For Robuverse LLP
                  </div>
                  <div className="h-[14mm] flex items-end justify-center relative">
                    {doc.showSignature && (
                      <img
                        src={
                          doc.signatoryName.toLowerCase().includes("nihal")
                            ? "/assets/nihal_sign.png"
                            : doc.signatoryName.toLowerCase().includes("shahul")
                            ? "/assets/shahul_sign.png"
                            : "/assets/mithlaj_sign.png"
                        }
                        alt="Signature"
                        className="h-[18mm] w-auto object-contain select-none -mb-1 filter brightness-0 contrast-200"
                      />
                    )}
                  </div>
                  <div className="w-[45mm] h-[1px] bg-slate-200 mx-auto my-1.5"></div>
                  <div className="text-[9px] font-semibold text-slate-400 tracking-wide uppercase">
                    Authorized Signatory
                  </div>
                  <div className="text-[9px] font-bold text-indigo-950 mt-0.5">
                    {doc.signatoryName}
                  </div>
                </div>
              </section>
            </div>

            {/* Bottom Footer Details */}
            <footer className="relative z-10 border-t border-[#b08f57]/30 pt-3 flex flex-col items-center text-center mt-auto">
              <div className="text-[8px] text-slate-500 font-medium flex items-center justify-center gap-1.5 leading-relaxed">
                <span>{settings.companyAddress || "Building No. 5/986/E, Kattangal, Chathamangalam, Kozhikode, Kerala - 673601, India"}</span>
                <span>•</span>
                <span>Ph: {settings.companyPhone || "+91 7356284208"}</span>
                <span>•</span>
                <span>www.robuverse.com</span>
                <span>•</span>
                <span>robuverselab@gmail.com</span>
              </div>
              <div className="text-[7.5px] text-slate-500 mt-1 uppercase tracking-widest font-bold flex items-center justify-center gap-2 leading-relaxed">
                {doc.showCompanyGst !== false && (
                  <>
                    <span>GSTIN: {settings.companyGstin || "32ABOFR0193C1ZE"}</span>
                    <span>•</span>
                  </>
                )}
                <span>LLPIN: ACZ-1342</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
