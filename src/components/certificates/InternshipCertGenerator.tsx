"use client";

import React, { useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

interface Candidate {
  recipientName: string;
  role: string;
  startDate: string;
  endDate: string;
  project: string;
  certId: string;
  signatoryName: string;
  signatoryTitle: string;
  placeOfIssue: string;
  issueDate: string;
}

const PRESETS: Candidate[] = [
  {
    recipientName: "Muhammed Ansil P",
    role: "Basic Electronics & Soldering",
    startDate: "2026-03-01",
    endDate: "2026-09-04",
    project: "basic electronics circuit design, component soldering, hardware testing, and PCB assembly",
    certId: "RV-INT-2026-105",
    signatoryName: "Shahul Hameed",
    signatoryTitle: "Chief Operating Officer, Robuverse LLP",
    placeOfIssue: "Kozhikode, Kerala",
    issueDate: "2026-09-04",
  },
  {
    recipientName: "Muhammed shibili uk",
    role: "Robotics & Artificial Intelligence",
    startDate: "2026-05-25",
    endDate: "2026-07-16",
    project: "robotics and automation systems",
    certId: "RV-INT-2026-091",
    signatoryName: "Mithlaj MT.",
    signatoryTitle: "Co-Founder & Chief Technology Officer",
    placeOfIssue: "Kozhikode, Kerala",
    issueDate: "2026-07-16",
  },
  {
    recipientName: "VIDHYA ES",
    role: "Robotics & Artificial Intelligence",
    startDate: "2026-03-15",
    endDate: "2026-05-15",
    project: "robotics and automation systems",
    certId: "RV-INT-2026-092",
    signatoryName: "Mithlaj MT.",
    signatoryTitle: "Co-Founder & Chief Technology Officer",
    placeOfIssue: "Kozhikode, Kerala",
    issueDate: "2026-07-18",
  },
  {
    recipientName: "Aarav Sharma",
    role: "Full-Stack Web Development",
    startDate: "2026-04-01",
    endDate: "2026-07-01",
    project: "Robuverse internal portal & workflow automation services",
    certId: "RV-INT-2026-048",
    signatoryName: "Mithlaj P.",
    signatoryTitle: "Managing Partner, Robuverse. LLP",
    placeOfIssue: "Kozhikode, Kerala",
    issueDate: "2026-07-01",
  },
  {
    recipientName: "Nihal P.",
    role: "UI/UX Design",
    startDate: "2026-05-15",
    endDate: "2026-07-15",
    project: "Robuverse platform user interface redesign & design tokens",
    certId: "RV-INT-2026-092",
    signatoryName: "Mithlaj P.",
    signatoryTitle: "Managing Partner, Robuverse. LLP",
    placeOfIssue: "Kozhikode, Kerala",
    issueDate: "2026-07-15",
  },
];

const theme = {
  wrapper: "text-[#332b21]",
  accentText: "text-[#b08f57] font-semibold",
  secondaryAccent: "text-[#c5a880]",
  bodyText: "text-[#5a4e40]",
  badgeColor: "bg-[#8c6d3f] text-white border-[#70562f]",
  divider: "border-[#c5a880]/30",
  watermarkOpacity: "opacity-[0.04]",
  titleText: "text-[#4a3b2c]",
  nameText: "text-[#3d2f21]",
  stampColor: "text-[#b08f57]/20",
  footerText: "text-[#7a6f60]",
};

export default function InternshipCertGenerator() {
  const [formData, setFormData] = useState<Candidate>(PRESETS[0]);
  const [scale, setScale] = useState<number>(0.55);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateRandomId = () => {
    const rand = Math.floor(100 + Math.random() * 900);
    const year = new Date().getFullYear();
    setFormData((prev) => ({
      ...prev,
      certId: `RV-INT-${year}-${String(rand).padStart(3, "0")}`,
    }));
  };

  const handleSignatoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "Shahul Hameed" || val === "Shahul") {
      setFormData((prev) => ({
        ...prev,
        signatoryName: "Shahul Hameed",
        signatoryTitle: "Chief Operating Officer, Robuverse LLP",
      }));
    } else if (val === "Mithlaj MT.") {
      setFormData((prev) => ({
        ...prev,
        signatoryName: "Mithlaj MT.",
        signatoryTitle: "Co-Founder & Chief Technology Officer",
      }));
    } else if (val === "Mithlaj P.") {
      setFormData((prev) => ({
        ...prev,
        signatoryName: "Mithlaj P.",
        signatoryTitle: "Managing Partner, Robuverse. LLP",
      }));
    } else if (val === "Nihal V.") {
      setFormData((prev) => ({
        ...prev,
        signatoryName: "Nihal V.",
        signatoryTitle: "Managing Partner, Robuverse. LLP",
      }));
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("certificate-download-root");
    if (!element) return;

    setIsDownloading(true);
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
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      pdf.setProperties({
        title: `Certificate of Internship - ${formData.recipientName}`,
        subject: `Internship Completion Certificate for ${formData.recipientName} (${formData.certId})`,
        author: "Robuverse LLP",
        keywords: "Robuverse, Internship, Certificate",
        creator: "Robuverse LLP Certificate Generator",
      });

      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
      pdf.save(`Certificate_${formData.recipientName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>📜</span> Internship Completion Certificate Generator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate official internship completion certificates with custom candidate roles, project summaries, and signatures.
          </p>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{isDownloading ? "Generating PDF..." : "Download High-Res PDF"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Controls */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          {/* Preset Buttons */}
          <div>
            <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">
              Load Candidate Preset
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData(p)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    formData.recipientName === p.recipientName
                      ? "bg-indigo-950 border-indigo-500 text-white font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="truncate font-semibold text-slate-200">{p.recipientName}</div>
                  <div className="truncate text-[10px] text-slate-500">{p.role}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Recipient Full Name *</label>
            <input
              type="text"
              name="recipientName"
              value={formData.recipientName}
              onChange={handleChange}
              placeholder="e.g. Muhammed Ansil P"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-bold text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Internship Designation / Domain *</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="e.g. Basic Electronics & Soldering"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Key Project / Contribution Summary *</label>
            <textarea
              rows={3}
              name="project"
              value={formData.project}
              onChange={handleChange}
              placeholder="basic electronics circuit design, component soldering, hardware testing, and PCB assembly"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-slate-400 font-semibold">Certificate ID *</label>
              <button
                type="button"
                onClick={generateRandomId}
                className="text-[10px] text-indigo-400 hover:underline font-bold uppercase tracking-wider"
              >
                Generate ID
              </button>
            </div>
            <input
              type="text"
              name="certId"
              value={formData.certId}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Signatory Profile</label>
            <select
              onChange={handleSignatoryChange}
              value={formData.signatoryName}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-bold"
            >
              <option value="Shahul Hameed">Shahul Hameed (COO)</option>
              <option value="Mithlaj MT.">Mithlaj MT. (CTO)</option>
              <option value="Mithlaj P.">Mithlaj P. (Managing Partner)</option>
              <option value="Nihal V.">Nihal V. (Managing Partner)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Date of Issue</label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
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

        {/* Right Preview Panel */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-xl border border-slate-800 mb-3 text-xs">
            <span className="text-slate-400">Preview Scale:</span>
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
            <CertificateLayout formData={formData} theme={theme} showWatermark={showWatermark} />
          </div>
        </div>
      </div>

      {/* Hidden Download Root Target for jsPDF */}
      <div id="certificate-download-root" className="hidden">
        <CertificateLayout formData={formData} theme={theme} showWatermark={showWatermark} isPrint />
      </div>
    </div>
  );
}

// Sub-component: EXACT ORIGINAL Internship Certificate Layout
const CertificateLayout: React.FC<{ formData: Candidate; theme: any; showWatermark: boolean; isPrint?: boolean }> = ({
  formData,
  theme,
  showWatermark,
  isPrint = false,
}) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  return (
    <div
      id={isPrint ? undefined : "certificate"}
      className={`w-[210mm] h-[297mm] relative p-[22mm] flex flex-col justify-start overflow-hidden shadow-2xl transition-all duration-300 ${theme.wrapper}`}
      style={{
        boxSizing: "border-box",
        backgroundImage: "url('/assets/bg_dark.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Deluxe Multi-Tier Gold Edge Frame & Corner Ornaments */}
      <div className={`absolute top-[4.5mm] left-[4.5mm] w-10 h-10 border-t-[3px] border-l-[3px] border-[#b08f57] z-20`}></div>
      <div className={`absolute top-[4.5mm] right-[4.5mm] w-10 h-10 border-t-[3px] border-r-[3px] border-[#b08f57] z-20`}></div>
      <div className={`absolute bottom-[4.5mm] left-[4.5mm] w-10 h-10 border-b-[3px] border-l-[3px] border-[#b08f57] z-20`}></div>
      <div className={`absolute bottom-[4.5mm] right-[4.5mm] w-10 h-10 border-b-[3px] border-r-[3px] border-[#b08f57] z-20`}></div>

      {/* Outer Solid Metallic Edge Border */}
      <div className={`absolute inset-[5.5mm] border-[2px] border-[#b08f57] pointer-events-none z-20`}></div>

      {/* Inner Dual Pinstripe Frame */}
      <div className={`absolute inset-[7.5mm] border border-[#b08f57]/50 pointer-events-none z-20`}></div>
      <div className={`absolute inset-[9.5mm] border border-dashed border-[#b08f57]/30 pointer-events-none z-20`}></div>

      {/* Corner Filigree Diamond Accents */}
      <div className={`absolute top-[4mm] left-[4mm] text-[10px] text-[#b08f57] font-bold z-25`}>✦</div>
      <div className={`absolute top-[4mm] right-[4mm] text-[10px] text-[#b08f57] font-bold z-25`}>✦</div>
      <div className={`absolute bottom-[4mm] left-[4mm] text-[10px] text-[#b08f57] font-bold z-25`}>✦</div>
      <div className={`absolute bottom-[4mm] right-[4mm] text-[10px] text-[#b08f57] font-bold z-25`}>✦</div>

      {/* Watermark Logo (Center background) */}
      {showWatermark && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none ${theme.watermarkOpacity} z-0`}>
          <img src="/assets/logo.png" alt="Watermark" className="w-[100mm] h-auto object-contain max-h-[140mm] grayscale" />
        </div>
      )}

      {/* Top Left Certificate Number */}
      <div className="absolute top-[14mm] left-[14mm] text-left z-20">
        <div className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold">Certificate No.</div>
        <div className={`text-[12px] font-mono font-bold tracking-wider mt-0.5 ${theme.accentText}`}>
          {formData.certId}
        </div>
      </div>

      {/* Central Flow Container */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 -mt-[2mm]">
        {/* Logo & Robuverse Title */}
        <div className="flex flex-col items-center mb-6">
          <img src="/assets/logo.png" alt="Robuverse Logo" className="h-[22mm] w-auto object-contain mb-2.5" />
          <div className="text-center">
            <div className={`font-cinzel text-[21px] font-semibold tracking-[0.22em] ${theme.titleText} leading-none`}>
              Robuverse. LLP
            </div>
            <div className="text-[8px] font-semibold tracking-[0.2em] text-slate-400 mt-3 uppercase flex items-center justify-center gap-1.5">
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
        <div className="text-center mb-5">
          <h3 className={`font-cinzel text-[25px] font-medium tracking-[0.22em] ${theme.titleText} uppercase`}>
            Certificate of Internship
          </h3>
          <div className="w-12 h-[1px] bg-slate-300 mx-auto mt-3"></div>
        </div>

        {/* Single Cohesive Paragraph Content Block */}
        <div className="text-center max-w-[165mm] mx-auto px-4 mt-2">
          <p className={`font-montserrat text-[12.5px] leading-[1.9] ${theme.bodyText}`}>
            This is to certify that <strong className={`font-bold ${theme.titleText} text-[15px] tracking-wide font-sans`}>{formData.recipientName}</strong> has successfully completed the Internship Program in{" "}
            <strong className={`font-bold ${theme.titleText} text-[13px] uppercase tracking-wider`}>{formData.role}</strong> at{" "}
            <strong className={`font-bold ${theme.titleText}`}>Robuverse. LLP</strong>, conducted from{" "}
            <strong className={`font-semibold ${theme.titleText}`}>{formatDate(formData.startDate)}</strong> to{" "}
            <strong className={`font-semibold ${theme.titleText}`}>{formatDate(formData.endDate)}</strong>. During this period, the intern actively participated in research, circuit design, component soldering, hardware testing, and practical implementation of{" "}
            <strong className={`font-semibold ${theme.titleText}`}>{formData.project || "basic electronics circuits and hardware systems"}</strong>. The intern demonstrated dedication, professionalism, teamwork and a strong willingness to learn. We appreciate the contributions made during the internship and wish them continued success in their future endeavors.
          </p>
        </div>

        {/* Signatures & Stamp block */}
        <div className="flex justify-center items-end w-full gap-[35mm] mt-9">
          {/* Digital Seal Stamp */}
          <div className="flex items-center">
            <div className="relative w-[26mm] h-[26mm] flex items-center justify-center select-none opacity-90">
              <img src="/assets/digital_seal.png" alt="Robuverse Seal" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Single Signatory */}
          <div className="text-center">
            <div className="h-[12mm] flex items-end justify-center relative">
              {formData.signatoryName && formData.signatoryName.toLowerCase().includes("mithlaj") ? (
                <img src="/assets/mithlaj_sign.png" alt="Signature" className="h-[18mm] w-auto object-contain select-none -mb-1.5 filter brightness-0 contrast-200" />
              ) : formData.signatoryName && formData.signatoryName.toLowerCase().includes("nihal") ? (
                <img src="/assets/nihal_sign.png" alt="Signature" className="h-[18mm] w-auto object-contain select-none -mb-1.5 filter brightness-0 contrast-200" />
              ) : formData.signatoryName && formData.signatoryName.toLowerCase().includes("shahul") ? (
                <img src="/assets/shahul_sign.png" alt="Signature" className="h-[18mm] w-auto object-contain select-none -mb-1.5 filter brightness-0 contrast-200" />
              ) : (
                <span className="font-alex-brush text-3xl text-indigo-955/80 select-none pb-0.5">
                  {formData.signatoryName ? formData.signatoryName.split(" ")[0] : ""}
                </span>
              )}
            </div>
            <div className={`w-[50mm] h-[1px] bg-slate-200/80 mx-auto my-1.5`}></div>
            <div className={`text-[11px] font-semibold ${theme.titleText} tracking-wide uppercase`}>
              {formData.signatoryName}
            </div>
            <div className="text-[9px] text-slate-400 font-medium tracking-wide mt-0.5">
              {formData.signatoryTitle}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info Row: Location, Date & QR code */}
      <div className={`border-t ${theme.divider} pt-4 px-6 flex justify-between items-center relative z-10 mt-auto`}>
        <div className="flex flex-col gap-1.5 text-[9.5px] text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Place of Issue: <strong className={`font-semibold ${theme.titleText}`}>{formData.placeOfIssue}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Date of Issue: <strong className={`font-semibold ${theme.titleText}`}>{formatDate(formData.issueDate)}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[9px]">This certificate can be verified using the QR code.</span>
          </div>
        </div>

        {/* Verification QR Code Box */}
        <div className="bg-white p-1 rounded border border-slate-200 shadow-sm flex items-center justify-center">
          <div className="w-[16mm] h-[16mm] relative">
            <img
              src={
                formData.recipientName.toLowerCase().includes("ansil")
                  ? "/assets/qr-code-ansil.png"
                  : formData.recipientName.toLowerCase().includes("rishal")
                  ? "/assets/qr-code-rishal.png"
                  : formData.recipientName.toLowerCase().includes("shibil")
                  ? "/assets/qr-code_shibil.png"
                  : formData.recipientName.toLowerCase().includes("vidhya") || formData.recipientName.toLowerCase().includes("vidya")
                  ? "/assets/qr-code-vidya.png"
                  : "/assets/qr-code-ansil.png"
              }
              alt="Verification QR Code"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Robuverse LLP Address Info Bottom Footer */}
      <div className={`border-t ${theme.divider} pt-3 flex flex-col items-center text-center mt-3 relative z-10`}>
        <div className={`text-[8px] ${theme.footerText} mt-0.5 flex items-center justify-center gap-1.5`}>
          <span>Near NIT Calicut, Kozhikode, Kerala - 673601, India</span>
          <span>•</span>
          <span>www.robuverse.com</span>
          <span>•</span>
          <span>robuverselab@gmail.com</span>
        </div>
        <div className="text-[6.5px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
          LLPIN: ACZ-1342
        </div>
      </div>
    </div>
  );
};
