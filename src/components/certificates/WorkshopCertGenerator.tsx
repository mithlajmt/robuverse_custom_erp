"use client";

import React, { useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import JSZip from "jszip";

interface WorkshopCandidate {
  recipientName: string;
  certType: string;
  topic: string;
  startDate: string;
  endDate: string;
  duration: string;
  venue: string;
  certId: string;
  signatory1Name: string;
  signatory1Title: string;
  signatory2Name: string;
  signatory2Title: string;
  placeOfIssue: string;
  issueDate: string;
}

const PRESETS: WorkshopCandidate[] = [
  {
    recipientName: "Adithya K. Kumar",
    certType: "Participation",
    topic: "Tech Talk on Future of Robotics & Artificial Intelligence",
    startDate: "2026-08-13",
    endDate: "2026-08-13",
    duration: "1 Day",
    venue: "Lourde Institute of Science & Technology, Kannur",
    certId: "RV-WS-2026-102",
    signatory1Name: "Mithlaj MT.",
    signatory1Title: "Co-Founder & CTO, Robuverse LLP",
    signatory2Name: "Nihal V.",
    signatory2Title: "Co-Founder & CEO, Robuverse LLP",
    placeOfIssue: "Kozhikode, Kerala",
    issueDate: "2026-08-13",
  },
  {
    recipientName: "Meera Jasmine",
    certType: "Completion",
    topic: "Autonomous Mobile Robots & ROS 2 Navigation",
    startDate: "2026-07-05",
    endDate: "2026-07-09",
    duration: "5 Days",
    venue: "Robuverse Research Labs",
    certId: "RV-WS-2026-056",
    signatory1Name: "Mithlaj MT.",
    signatory1Title: "Co-Founder & CTO, Robuverse LLP",
    signatory2Name: "Nihal V.",
    signatory2Title: "Co-Founder & CEO, Robuverse LLP",
    placeOfIssue: "Kozhikode, Kerala",
    issueDate: "2026-07-09",
  },
];

export default function WorkshopCertGenerator() {
  const [formData, setFormData] = useState<WorkshopCandidate>(PRESETS[0]);
  const [scale, setScale] = useState<number>(0.55);
  const [bulkList, setBulkList] = useState<{ certId: string; recipientName: string }[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws, { header: 1 });

        const parsed: { certId: string; recipientName: string }[] = [];
        let startIndex = 0;
        if (data.length > 0 && data[0] && Array.isArray(data[0])) {
          const row0Str = JSON.stringify(data[0]).toLowerCase();
          if (row0Str.includes("certificate") || row0Str.includes("name") || row0Str.includes("id")) {
            startIndex = 1;
          }
        }

        for (let i = startIndex; i < data.length; i++) {
          const row = data[i];
          if (row && Array.isArray(row) && (row[0] || row[1])) {
            const certId = String(row[0] || `RV-WS-2026-${100 + i}`).trim();
            const recipientName = String(row[1] || "").trim();
            if (recipientName) {
              parsed.push({ certId, recipientName });
            }
          }
        }

        if (parsed.length > 0) {
          setBulkList(parsed);
          setActivePreviewIndex(0);
          setFormData((prev) => ({
            ...prev,
            certId: parsed[0].certId,
            recipientName: parsed[0].recipientName,
          }));
        }
      } catch (err) {
        console.error("Failed to parse spreadsheet file:", err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const selectBulkCandidate = (index: number) => {
    setActivePreviewIndex(index);
    if (bulkList[index]) {
      setFormData((prev) => ({
        ...prev,
        certId: bulkList[index].certId,
        recipientName: bulkList[index].recipientName,
      }));
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("workshop-cert-landscape-print-target");
    if (!element) return;

    setIsProcessing(true);
    try {
      element.style.display = "block";
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      element.style.display = "none";

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      pdf.setProperties({
        title: `Workshop Certificate - ${formData.recipientName}`,
        subject: `Workshop Certificate for ${formData.recipientName}`,
        author: "Robuverse LLP",
      });

      pdf.addImage(imgData, "JPEG", 0, 0, 297, 210, undefined, "FAST");
      pdf.save(`Workshop_Certificate_${formData.recipientName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("Failed to export landscape PDF:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchDownloadZIP = async () => {
    if (bulkList.length === 0) return;
    const element = document.getElementById("workshop-cert-landscape-print-target");
    if (!element) return;

    setIsProcessing(true);
    try {
      element.style.display = "block";
      const zip = new JSZip();

      for (let i = 0; i < bulkList.length; i++) {
        const item = bulkList[i];
        setFormData((prev) => ({
          ...prev,
          certId: item.certId,
          recipientName: item.recipientName,
        }));

        await new Promise((r) => setTimeout(r, 150));

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });

        pdf.addImage(imgData, "JPEG", 0, 0, 297, 210, undefined, "FAST");
        const pdfBlob = pdf.output("blob");
        const safeName = `${item.certId}_${item.recipientName.replace(/\s+/g, "_")}.pdf`;
        zip.file(safeName, pdfBlob);
      }

      element.style.display = "none";
      const zipContent = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipContent);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Robuverse_Workshop_Certificates_${bulkList.length}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Batch ZIP export failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>🏆</span> Workshop & Event Certificate Generator (Landscape A4)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Horizontal landscape certificate matching the exact deep navy corner graphics & gold ribbon arcs of the vertical certificate.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {bulkList.length > 0 && (
            <button
              onClick={handleBatchDownloadZIP}
              disabled={isProcessing}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center space-x-2"
            >
              <span>{isProcessing ? "Zipping PDFs..." : `Download ZIP (${bulkList.length} PDFs)`}</span>
            </button>
          )}
          <button
            onClick={handleDownloadPDF}
            disabled={isProcessing}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{isProcessing ? "Generating PDF..." : "Download Landscape PDF"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Controls */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          {/* Excel Upload Box */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-indigo-800/40 space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
                📊 Excel Bulk Import (.xlsx / .csv)
              </label>
              {bulkList.length > 0 && (
                <span className="text-[10px] text-emerald-400 font-bold">{bulkList.length} Candidates Loaded</span>
              )}
            </div>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelUpload}
              className="w-full text-slate-300 text-xs file:bg-indigo-950 file:border-indigo-800 file:text-indigo-400 file:px-3 file:py-1 file:rounded-lg file:font-semibold"
            />
          </div>

          {/* Parsed Candidates List */}
          {bulkList.length > 0 && (
            <div className="max-h-36 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-2 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">Click candidate to preview:</span>
              {bulkList.map((c, idx) => (
                <div
                  key={idx}
                  onClick={() => selectBulkCandidate(idx)}
                  className={`p-1.5 rounded text-xs flex justify-between cursor-pointer ${
                    activePreviewIndex === idx ? "bg-indigo-950 text-indigo-400 font-bold border border-indigo-800/50" : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <span className="truncate">{idx + 1}. {c.recipientName}</span>
                  <span className="font-mono text-[10px]">{c.certId}</span>
                </div>
              ))}
            </div>
          )}

          {/* Form Fields */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Certificate Category</label>
            <select
              name="certType"
              value={formData.certType}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-bold"
            >
              <option value="Participation">Certificate of Participation</option>
              <option value="Completion">Certificate of Completion</option>
              <option value="Excellence">Certificate of Excellence</option>
              <option value="Appreciation">Certificate of Appreciation</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Participant Full Name *</label>
            <input
              type="text"
              name="recipientName"
              value={formData.recipientName}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-bold text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Workshop Topic / Event Title *</label>
            <textarea
              rows={2}
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Venue / Institution Name *</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Certificate ID</label>
              <input
                type="text"
                name="certId"
                value={formData.certId}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-indigo-400 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Place of Issue</label>
              <input
                type="text"
                name="placeOfIssue"
                value={formData.placeOfIssue}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
              />
            </div>
          </div>

          {/* Dual Signatories */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Signatory 1 (Left)</label>
              <input
                type="text"
                name="signatory1Name"
                value={formData.signatory1Name}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Signatory 2 (Right)</label>
              <input
                type="text"
                name="signatory2Name"
                value={formData.signatory2Name}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-slate-400 text-xs">Show Company Watermark Logo</span>
            <input
              type="checkbox"
              checked={showWatermark}
              onChange={(e) => setShowWatermark(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </div>
        </div>

        {/* Right Preview Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-xl border border-slate-800 mb-3 text-xs">
            <span className="text-slate-400">Landscape Scale:</span>
            <button
              onClick={() => setScale((s) => Math.max(0.3, s - 0.05))}
              className="px-2 py-0.5 rounded bg-slate-800 text-white font-bold"
            >
              -
            </button>
            <span className="font-mono text-white w-10 text-center">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale((s) => Math.min(1, s + 0.05))}
              className="px-2 py-0.5 rounded bg-slate-800 text-white font-bold"
            >
              +
            </button>
          </div>

          <div
            className="transition-transform duration-200"
            style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
          >
            <WorkshopParchmentLayout formData={formData} showWatermark={showWatermark} />
          </div>
        </div>
      </div>

      {/* Hidden Print Target */}
      <div id="workshop-cert-landscape-print-target" className="hidden">
        <WorkshopParchmentLayout formData={formData} showWatermark={showWatermark} isPrint />
      </div>
    </div>
  );
}

// Sub-component: HORIZONTAL LANDSCAPE WORKSHOP CERTIFICATE WITH RICH NAVY CORNERS & GOLD METALLIC ARCS
const WorkshopParchmentLayout = ({
  formData,
  showWatermark,
  isPrint = false,
}: {
  formData: WorkshopCandidate;
  showWatermark: boolean;
  isPrint?: boolean;
}) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const renderSignature = (name: string) => {
    if (!name) return null;
    const lower = name.toLowerCase();
    if (lower.includes("mithlaj")) {
      return <img src="/assets/mithlaj_sign.png" alt="Signature" className="h-[16mm] w-auto object-contain select-none -mb-1 filter brightness-0 contrast-200" />;
    } else if (lower.includes("nihal")) {
      return <img src="/assets/nihal_sign.png" alt="Signature" className="h-[16mm] w-auto object-contain select-none -mb-1 filter brightness-0 contrast-200" />;
    } else if (lower.includes("shahul")) {
      return <img src="/assets/shahul_sign.png" alt="Signature" className="h-[16mm] w-auto object-contain select-none -mb-1 filter brightness-0 contrast-200" />;
    } else {
      return <span className="font-alex-brush text-3xl text-[#3d2f21] select-none pb-0.5">{name.split(" ")[0]}</span>;
    }
  };

  return (
    <div
      id={isPrint ? undefined : "certificate-ws"}
      className="w-[297mm] h-[210mm] relative p-[14mm] flex flex-col justify-between overflow-hidden shadow-2xl text-[#332b21]"
      style={{
        boxSizing: "border-box",
        backgroundImage: "url('/assets/bg_dark.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* SVG Layer: EXACT ORIGINAL RICH DEEP NAVY BLUE CORNER SHAPES WITH GLOWING GOLD METALLIC RIBBON ARCS */}
      <div className="absolute inset-0 pointer-events-none z-15 select-none overflow-hidden">
        <svg viewBox="0 0 297 210" className="w-full h-full" style={{ display: "block" }}>
          <defs>
            {/* Rich Deep Navy Blue Gradient */}
            <linearGradient id="navyCornerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#040F26" />
              <stop offset="60%" stopColor="#0B1E40" />
              <stop offset="100%" stopColor="#020919" />
            </linearGradient>

            {/* Glowing Gold Metallic Ribbon Arc Gradient */}
            <linearGradient id="goldRibbonArc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B08F57" />
              <stop offset="35%" stopColor="#FFF5D6" />
              <stop offset="70%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#8A6B29" />
            </linearGradient>
          </defs>

          {/* TOP-LEFT RICH NAVY ANGLED CORNER WITH GOLD RIBBON ARC */}
          <polygon points="0,0 75,0 0,65" fill="url(#navyCornerGrad)" />
          <path d="M 0 65 L 75 0" stroke="url(#goldRibbonArc)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 0 70 L 80 0" stroke="url(#goldRibbonArc)" strokeWidth="1" opacity="0.6" fill="none" />

          {/* BOTTOM-RIGHT RICH NAVY ANGLED CORNER WITH GOLD RIBBON ARC */}
          <polygon points="297,210 222,210 297,145" fill="url(#navyCornerGrad)" />
          <path d="M 222 210 L 297 145" stroke="url(#goldRibbonArc)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 217 210 L 297 140" stroke="url(#goldRibbonArc)" strokeWidth="1" opacity="0.6" fill="none" />

          {/* LEFT MIDDLE NAVY ACCENT WING */}
          <polygon points="0,90 12,105 0,120" fill="url(#navyCornerGrad)" />
          <polyline points="0,90 12,105 0,120" stroke="url(#goldRibbonArc)" strokeWidth="1.5" fill="none" />

          {/* RIGHT MIDDLE NAVY ACCENT WING */}
          <polygon points="297,90 285,105 297,120" fill="url(#navyCornerGrad)" />
          <polyline points="297,90 285,105 297,120" stroke="url(#goldRibbonArc)" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      {/* Deluxe Multi-Tier Gold Edge Frame & Corner Ornaments */}
      <div className="absolute top-[4.5mm] left-[4.5mm] w-10 h-10 border-t-[3px] border-l-[3px] border-[#b08f57] z-20"></div>
      <div className="absolute top-[4.5mm] right-[4.5mm] w-10 h-10 border-t-[3px] border-r-[3px] border-[#b08f57] z-20"></div>
      <div className="absolute bottom-[4.5mm] left-[4.5mm] w-10 h-10 border-b-[3px] border-l-[3px] border-[#b08f57] z-20"></div>
      <div className="absolute bottom-[4.5mm] right-[4.5mm] w-10 h-10 border-b-[3px] border-r-[3px] border-[#b08f57] z-20"></div>

      {/* Outer Solid Metallic Edge Border */}
      <div className="absolute inset-[5.5mm] border-[2px] border-[#b08f57] pointer-events-none z-20"></div>
      <div className="absolute inset-[7.5mm] border border-[#b08f57]/50 pointer-events-none z-20"></div>
      <div className="absolute inset-[9.5mm] border border-dashed border-[#b08f57]/30 pointer-events-none z-20"></div>

      {/* Corner Filigree Diamond Accents */}
      <div className="absolute top-[4mm] left-[4mm] text-[10px] text-[#b08f57] z-25 font-bold">✦</div>
      <div className="absolute top-[4mm] right-[4mm] text-[10px] text-[#b08f57] z-25 font-bold">✦</div>
      <div className="absolute bottom-[4mm] left-[4mm] text-[10px] text-[#b08f57] z-25 font-bold">✦</div>
      <div className="absolute bottom-[4mm] right-[4mm] text-[10px] text-[#b08f57] z-25 font-bold">✦</div>

      {/* Watermark Logo */}
      {showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04] z-0">
          <img src="/assets/logo.png" alt="Watermark" className="w-[120mm] h-auto object-contain max-h-[140mm] grayscale" />
        </div>
      )}

      {/* Top Left Cert No */}
      <div className="absolute top-[14mm] left-[14mm] text-left z-25">
        <div className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold">Certificate No.</div>
        <div className="text-[12px] font-mono font-bold tracking-wider mt-0.5 text-[#b08f57]">
          {formData.certId}
        </div>
      </div>

      {/* Central Flow Container */}
      <div className="flex-1 flex flex-col items-center justify-between relative z-20 pt-[2mm] pb-[1mm]">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-1">
          <img src="/assets/logo.png" alt="Robuverse Logo" className="h-[20mm] w-auto object-contain mb-2" />
          <div className="text-center">
            <div className="font-cinzel text-[22px] font-bold tracking-[0.22em] text-[#4a3b2c] leading-none">
              ROBUVERSE. LLP
            </div>
            <div className="text-[8px] font-semibold tracking-[0.2em] text-[#8c6d3f] uppercase mt-2 flex items-center justify-center gap-1.5">
              <span>Robotics</span><span>•</span>
              <span>AI</span><span>•</span>
              <span>Automation</span><span>•</span>
              <span>Software</span><span>•</span>
              <span>IoT</span><span>•</span>
              <span>3D Printing</span>
            </div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center my-1 w-full max-w-[220mm]">
          <h3 className="font-cinzel text-[24px] font-medium tracking-[0.22em] text-[#4a3b2c] uppercase">
            CERTIFICATE OF {formData.certType.toUpperCase()}
          </h3>
          <div className="w-16 h-[1.5px] bg-[#b08f57] mx-auto mt-2"></div>
        </div>

        {/* Recipient Content Statement */}
        <div className="text-center max-w-[220mm] mx-auto px-4 my-1">
          <p className="font-montserrat text-[10.5px] uppercase tracking-[0.2em] text-[#8c6d3f] font-semibold mb-1">
            THIS IS PROUDLY PRESENTED TO
          </p>

          <h3 className="font-cinzel text-[28px] font-black text-[#2a1f14] tracking-wider py-1 border-b border-[#b08f57]/30 inline-block px-8 mb-2">
            {formData.recipientName}
          </h3>

          <p className="font-montserrat text-[12px] leading-[1.85] text-[#5a4e40] max-w-[210mm] mx-auto">
            for actively participating in the practical training program on{" "}
            <strong className="font-cinzel text-[13.5px] font-bold tracking-wider text-[#4a3b2c] block mt-1 mb-1">
              {formData.topic || "Tech Talk on Future of Robotics & Artificial Intelligence"}
            </strong>
            conducted by <strong className="font-bold text-[#3d2f21]">Robuverse. LLP</strong> at{" "}
            <strong className="font-semibold text-[#3d2f21]">{formData.venue}</strong>,{" "}
            {formData.startDate === formData.endDate ? (
              <>on <strong className="font-semibold text-[#3d2f21]">{formatDate(formData.startDate)}</strong></>
            ) : (
              <>from <strong className="font-semibold text-[#3d2f21]">{formatDate(formData.startDate)}</strong> to <strong className="font-semibold text-[#3d2f21]">{formatDate(formData.endDate)}</strong></>
            )}.
          </p>
        </div>

        {/* Dual Signatures & Centered Gold Seal Stamp */}
        <div className="flex justify-between items-end w-[220mm] mx-auto mt-1">
          {/* Signatory 1 (Left) */}
          <div className="text-center w-[65mm]">
            <div className="h-[14mm] flex items-end justify-center relative">
              {renderSignature(formData.signatory1Name)}
            </div>
            <div className="w-[50mm] h-[1px] bg-[#b08f57]/60 mx-auto my-1.5"></div>
            <div className="text-[11px] font-semibold text-[#4a3b2c] tracking-wide uppercase">
              {formData.signatory1Name}
            </div>
            <div className="text-[9px] text-slate-400 font-medium tracking-wide mt-0.5">
              {formData.signatory1Title}
            </div>
          </div>

          {/* Centered Digital Seal Stamp */}
          <div className="flex justify-center items-center w-[40mm]">
            <div className="relative w-[24mm] h-[24mm] flex items-center justify-center select-none opacity-90">
              <img src="/assets/digital_seal.png" alt="Robuverse Seal" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Signatory 2 (Right) */}
          <div className="text-center w-[65mm]">
            <div className="h-[14mm] flex items-end justify-center relative">
              {renderSignature(formData.signatory2Name)}
            </div>
            <div className="w-[50mm] h-[1px] bg-[#b08f57]/60 mx-auto my-1.5"></div>
            <div className="text-[11px] font-semibold text-[#4a3b2c] tracking-wide uppercase">
              {formData.signatory2Name}
            </div>
            <div className="text-[9px] text-slate-400 font-medium tracking-wide mt-0.5">
              {formData.signatory2Title}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info Row: Location & Date */}
      <div className="border-t border-[#c5a880]/30 pt-2 px-[14mm] flex justify-between items-center relative z-20 mt-1">
        <div className="flex items-center gap-1.5 text-[9.5px] text-slate-400 font-medium">
          <svg className="w-3.5 h-3.5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Place of Issue: <strong className="font-semibold text-[#4a3b2c]">{formData.placeOfIssue}</strong></span>
        </div>

        {/* Center Corporate Address */}
        <div className="flex flex-col items-center text-center">
          <div className="text-[8px] text-[#7a6f60] font-medium flex items-center justify-center gap-1.5">
            <span>Near NIT Calicut, Kozhikode, Kerala - 673601, India</span>
            <span>•</span>
            <span>www.robuverse.com</span>
            <span>•</span>
            <span>robuverselab@gmail.com</span>
          </div>
          <div className="text-[6.5px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">
            LLPIN: ACZ-1342
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[9.5px] text-slate-400 font-medium">
          <svg className="w-3.5 h-3.5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Date of Issue: <strong className="font-semibold text-[#4a3b2c]">{formatDate(formData.issueDate)}</strong></span>
        </div>
      </div>
    </div>
  );
};
