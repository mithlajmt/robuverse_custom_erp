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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <GraduationCap className="h-7 w-7 text-indigo-600" />
            <span>Certificate Generator</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Generate, customize, and bulk-export high-resolution Robuverse certificates.
          </p>
        </div>

        {/* Sub-mode Navigation */}
        <div className="flex items-center space-x-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <button
            onClick={() => setCertMode("internship")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              certMode === "internship"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Internship Completion</span>
          </button>
          <button
            onClick={() => setCertMode("workshop")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              certMode === "workshop"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
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
