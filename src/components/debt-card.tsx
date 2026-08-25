"use client";

import { useState } from "react";
import { DebtDirection, DebtStatus } from "@prisma/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DebtPaymentForm } from "@/components/debt-payment-form";
import {
  ChevronDown,
  ChevronUp,
  History,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft
} from "lucide-react";

export type SerializedTransaction = {
  id: string;
  type: string;
  status: string;
  cashFlowDirection: string;
  amount: string;
  description: string;
  transactionDate: string;
  paymentMethod: string;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SerializedDebt = {
  id: string;
  personName: string;
  direction: DebtDirection;
  amount: string;
  paidAmount: string;
  remainingAmount: string;
  status: DebtStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  transactions: SerializedTransaction[];
};

type DebtCardProps = {
  debt: SerializedDebt;
};

export function DebtCard({ debt }: DebtCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const amount = Number(debt.amount);
  const paidAmount = Number(debt.paidAmount);
  const remainingAmount = Number(debt.remainingAmount);
  const progressPercent = amount > 0 ? Math.min(100, Math.round((paidAmount / amount) * 100)) : 0;

  return (
    <div className="border border-slate-800/80 bg-slate-950/20 rounded-xl p-4 transition-all duration-200 hover:border-slate-700/60">
      {/* Collapsed/Header View */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between gap-3 cursor-pointer select-none"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-200 text-sm md:text-base truncate">{debt.personName}</h3>
            
            {/* Direction Tag */}
            <span
              className={`text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded border ${
                debt.direction === "RECEIVABLE"
                  ? "bg-green-500/10 border-green-500/20 text-green-450 text-green-400"
                  : "bg-purple-500/10 border-purple-500/20 text-purple-400"
              }`}
            >
              {debt.direction === "RECEIVABLE" ? "Debtor" : "Creditor"}
            </span>

            {/* Status Tag */}
            <span
              className={`text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded border ${
                debt.status === "PAID"
                  ? "bg-green-500/15 border-green-500/20 text-green-300"
                  : debt.status === "PARTIAL"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {debt.status}
            </span>
          </div>
          
          {debt.notes && !isExpanded && (
            <p className="text-[11px] text-slate-500 truncate mt-1 italic">&ldquo;{debt.notes}&rdquo;</p>
          )}

          {/* Simple progress metric for mobile */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex-1 overflow-hidden h-1.5 rounded-full bg-slate-850">
              <div
                style={{ width: `${progressPercent}%` }}
                className={`h-full rounded-full ${
                  debt.direction === "RECEIVABLE" ? "bg-green-500" : "bg-purple-500"
                }`}
              />
            </div>
            <span className="text-[9px] font-semibold text-slate-500 shrink-0">{progressPercent}%</span>
          </div>
        </div>

        {/* Right side balance & toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Remaining</p>
            <p className={`text-sm md:text-base font-bold mt-0.5 ${
              remainingAmount > 0 
                ? debt.direction === "RECEIVABLE" 
                  ? "text-green-400" 
                  : "text-purple-400"
                : "text-slate-500"
            }`}>
              {formatCurrency(remainingAmount)}
            </p>
          </div>
          
          <div className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 transition shrink-0">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Detail Panel */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-850 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {debt.notes && (
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Notes / Description</p>
              <p className="text-xs text-slate-300 mt-1 bg-slate-950/20 p-2 rounded border border-slate-850 italic">
                &ldquo;{debt.notes}&rdquo;
              </p>
            </div>
          )}

          {/* Detailed numbers */}
          <div className="grid grid-cols-3 gap-2 text-center bg-slate-950/40 p-3 rounded-lg border border-slate-850/40">
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider">Total</p>
              <p className="text-xs md:text-sm font-semibold text-slate-400 mt-0.5">{formatCurrency(amount)}</p>
            </div>
            <div>
              <p className="text-[9px] text-cyan-400 uppercase tracking-wider font-semibold">Paid</p>
              <p className="text-xs md:text-sm font-semibold text-cyan-400 mt-0.5">{formatCurrency(paidAmount)}</p>
            </div>
            <div>
              <p className="text-[9px] text-rose-400 uppercase tracking-wider font-semibold">Remaining</p>
              <p className="text-xs md:text-sm font-semibold text-rose-400 mt-0.5">{formatCurrency(remainingAmount)}</p>
            </div>
          </div>

          {/* Payment History */}
          {debt.transactions.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                <History className="h-3 w-3" />
                <span>Recent payments (Partial/Full)</span>
              </div>
              <div className="grid gap-1.5">
                {debt.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center bg-slate-950/20 p-2 rounded border border-slate-850 text-xs"
                  >
                    <span className="text-slate-400 flex items-center gap-1.5 min-w-0">
                      <Calendar className="h-3 w-3 text-slate-600 shrink-0" />
                      <span className="truncate">{formatDate(tx.transactionDate)} • {tx.description}</span>
                    </span>
                    <span className="font-semibold text-slate-300 shrink-0 pl-2">
                      {formatCurrency(tx.amount.toString())}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-[10px] text-slate-500">No payment history recorded yet.</p>
            </div>
          )}

          {/* Payment Form */}
          <div className="pt-1">
            <DebtPaymentForm
              debtId={debt.id}
              remainingAmount={remainingAmount.toString()}
              disabled={remainingAmount <= 0 || debt.status === "PAID"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
