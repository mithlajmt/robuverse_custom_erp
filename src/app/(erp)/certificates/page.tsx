"use client";

import React, { useState } from "react";
import InternshipCertGenerator from "@/components/certificates/InternshipCertGenerator";
import WorkshopCertGenerator from "@/components/certificates/WorkshopCertGenerator";
import { Award, FileSpreadsheet, GraduationCap } from "lucide-react";

export default function CertificatesPage() {
  const [certMode, setCertMode] = useState<"internship" | "workshop">("internship");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
            <GraduationCap className="h-7 w-7 text-cyan-400" />
            <span>Certificate Generator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate, customize, and bulk-export high-resolution Robuverse certificates.
          </p>
        </div>

        {/* Sub-mode Navigation */}
        <div className="flex items-center space-x-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 w-fit backdrop-blur shadow-lg">
          <button
            onClick={() => setCertMode("internship")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              certMode === "internship"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Internship Completion</span>
          </button>
          <button
            onClick={() => setCertMode("workshop")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              certMode === "workshop"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Workshop (Bulk Excel)</span>
          </button>
        </div>
      </div>

      {certMode === "internship" ? <InternshipCertGenerator /> : <WorkshopCertGenerator />}
    </div>
  );
}
