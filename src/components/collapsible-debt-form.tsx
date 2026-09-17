"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { AddDebtForm } from "@/components/add-debt-form";

export function CollapsibleDebtForm() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white hover:bg-slate-50 text-indigo-700 py-3 px-4 text-xs font-extrabold transition duration-200 xl:hidden shadow-sm cursor-pointer"
      >
        {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        <span>{isOpen ? "Close Account Creator" : "Create New Account"}</span>
      </button>

      {/* Form Container */}
      <div className={`${isOpen ? "block" : "hidden"} xl:block`}>
        <AddDebtForm />
      </div>
    </div>
  );
}
