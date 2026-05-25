"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { navItems } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function MobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative z-[70]">
      <button
        type="button"
        className="relative z-[70] inline-flex h-12 w-12 touch-manipulation items-center justify-center rounded-lg border border-cyan-300/25 bg-slate-900 text-cyan-50 shadow-lg shadow-black/20 active:bg-cyan-300/15"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
      >
        {children}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] overflow-hidden bg-slate-950"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex h-dvh w-full flex-col bg-slate-950 p-5 sm:ml-auto sm:max-w-sm sm:border-l sm:border-cyan-300/15">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-cyan-50">Navigation</p>
              <Button variant="ghost" className="h-11 w-11 px-0" onClick={() => setOpen(false)} aria-label="Close navigation">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="mt-6 grid gap-2 overflow-y-auto pb-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-cyan-300/10 px-4 py-4 text-base text-cyan-50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
