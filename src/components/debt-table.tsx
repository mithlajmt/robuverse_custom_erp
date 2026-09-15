"use client";

import { useState } from "react";
import { SerializedDebt } from "@/components/debt-card";
import { DebtPaymentForm } from "@/components/debt-payment-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import { X, History, Calendar, CreditCard } from "lucide-react";

type DebtTableProps = {
  debts: SerializedDebt[];
};

export function DebtTable({ debts }: DebtTableProps) {
  const [selectedDebt, setSelectedDebt] = useState<SerializedDebt | null>(null);
  
  // Filtering states
  const [directionFilter, setDirectionFilter] = useState<"ALL" | "RECEIVABLE" | "PAYABLE">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNPAID" | "PAID">("ALL");

  const closeModal = () => setSelectedDebt(null);

  // Filter debts
  const filteredDebts = debts.filter((debt) => {
    // 1. Direction Filter
    if (directionFilter !== "ALL" && debt.direction !== directionFilter) {
      return false;
    }
    // 2. Status Filter
    if (statusFilter === "UNPAID" && debt.status === "PAID") {
      return false;
    }
    if (statusFilter === "PAID" && debt.status !== "PAID") {
      return false;
    }
    return true;
  });

  // Calculate filtered totals
  const filteredTotal = filteredDebts.reduce((sum, d) => sum + Number(d.amount), 0);
  const filteredPaid = filteredDebts.reduce((sum, d) => sum + Number(d.paidAmount), 0);
  const filteredRemaining = filteredDebts.reduce((sum, d) => sum + Number(d.remainingAmount), 0);

  // Parse details for the selected debt modal if open
  const amount = selectedDebt ? Number(selectedDebt.amount) : 0;
  const paidAmount = selectedDebt ? Number(selectedDebt.paidAmount) : 0;
  const remainingAmount = selectedDebt ? Number(selectedDebt.remainingAmount) : 0;
  const progressPercent = amount > 0 ? Math.min(100, Math.round((paidAmount / amount) * 100)) : 0;

  return (
    <div className="w-full bg-slate-900 border border-slate-850 rounded-xl overflow-hidden shadow-lg">
      
      {/* Filters Toolbar */}
      <div className="p-3 bg-slate-950/20 border-b border-slate-850 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Account Type Filter */}
        <div className="flex items-center gap-1 bg-slate-950/40 p-0.5 rounded-lg border border-slate-850/80">
          <button
            onClick={() => setDirectionFilter("ALL")}
            className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold transition ${
              directionFilter === "ALL"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Accounts
          </button>
          <button
            onClick={() => setDirectionFilter("RECEIVABLE")}
            className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold transition ${
              directionFilter === "RECEIVABLE"
                ? "bg-green-500/10 text-green-400 border border-green-500/15"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            To Get
          </button>
          <button
            onClick={() => setDirectionFilter("PAYABLE")}
            className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold transition ${
              directionFilter === "PAYABLE"
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/15"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            To Give
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-slate-950/40 p-0.5 rounded-lg border border-slate-850/80">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold transition ${
              statusFilter === "ALL"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => setStatusFilter("UNPAID")}
            className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold transition ${
              statusFilter === "UNPAID"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("PAID")}
            className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold transition ${
              statusFilter === "PAID"
                ? "bg-green-500/10 text-green-400 border border-green-500/15"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Settled
          </button>
        </div>
      </div>

      {/* Filter Sums Banner */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-850 flex items-center justify-between text-[10px] md:text-xs text-slate-400 font-semibold select-none">
        <div>
          Showing {filteredDebts.length} of {debts.length} records
        </div>
        <div className="flex gap-3">
          <span>Total: <span className="text-slate-300">{formatCurrency(filteredTotal)}</span></span>
          <span>Remaining: <span className="text-rose-400">{formatCurrency(filteredRemaining)}</span></span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto w-full scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[700px] lg:min-w-0">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider select-none">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Total</th>
              <th className="py-3 px-4 text-right text-cyan-400">Paid</th>
              <th className="py-3 px-4 text-right text-rose-400">Remaining</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {filteredDebts.map((debt) => {
              const dAmount = Number(debt.amount);
              const dPaid = Number(debt.paidAmount);
              const dRemaining = Number(debt.remainingAmount);
              const dProgress = dAmount > 0 ? Math.min(100, Math.round((dPaid / dAmount) * 100)) : 0;

              return (
                <tr 
                  key={debt.id}
                  onClick={() => setSelectedDebt(debt)}
                  className="hover:bg-slate-800/40 cursor-pointer transition duration-150"
                >
                  {/* Name & Note */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200 text-xs md:text-sm">{debt.personName}</div>
                    {debt.notes && (
                      <div className="text-[10px] text-slate-500 truncate max-w-[180px] mt-0.5 italic">
                        {debt.notes}
                      </div>
                    )}
                  </td>

                  {/* Direction */}
                  <td className="py-3 px-4">
                    <span
                      className={`text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded border ${
                        debt.direction === "RECEIVABLE"
                          ? "bg-green-500/10 border-green-500/20 text-green-400"
                          : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                      }`}
                    >
                      {debt.direction === "RECEIVABLE" ? "Debtor (Get)" : "Creditor (Give)"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
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
                  </td>

                  {/* Total Amount */}
                  <td className="py-3 px-4 text-right font-mono text-xs text-slate-400">
                    {formatCurrency(dAmount)}
                  </td>

                  {/* Paid Amount */}
                  <td className="py-3 px-4 text-right font-mono text-xs text-cyan-400">
                    {formatCurrency(dPaid)}
                    <span className="text-[8px] text-slate-500 ml-1">({dProgress}%)</span>
                  </td>

                  {/* Remaining Amount */}
                  <td className="py-3 px-4 text-right font-mono text-xs font-bold text-rose-400">
                    {formatCurrency(dRemaining)}
                  </td>

                  {/* Quick Action Button */}
                  <td className="py-3 px-4 text-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDebt(debt);
                      }}
                      className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 underline transition"
                    >
                      Pay/View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Popup Panel */}
      {selectedDebt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div 
            onClick={closeModal} 
            className="absolute inset-0"
          />
          
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-5 md:p-6 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="pr-8 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">{selectedDebt.personName}</h3>
                
                <span className={`text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded border ${
                  selectedDebt.direction === "RECEIVABLE"
                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                    : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                }`}>
                  {selectedDebt.direction === "RECEIVABLE" ? "Debtor" : "Creditor"}
                </span>

                <span className={`text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded border ${
                  selectedDebt.status === "PAID"
                    ? "bg-green-500/15 border-green-500/20 text-green-300"
                    : selectedDebt.status === "PARTIAL"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}>
                  {selectedDebt.status}
                </span>
              </div>
              
              {selectedDebt.notes && (
                <p className="text-xs text-slate-500 mt-2 bg-slate-950/30 p-2 rounded border border-slate-850/50 italic">
                  &ldquo;{selectedDebt.notes}&rdquo;
                </p>
              )}
            </div>

            {/* Progress and Numbers */}
            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-950/40 p-3 rounded-xl border border-slate-850/40">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Total</p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-0.5">{formatCurrency(amount)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-cyan-400 uppercase tracking-wider font-semibold">Paid</p>
                  <p className="text-xs sm:text-sm font-semibold text-cyan-400 mt-0.5">{formatCurrency(paidAmount)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-rose-400 uppercase tracking-wider font-semibold">Remaining</p>
                  <p className="text-xs sm:text-sm font-semibold text-rose-400 mt-0.5">{formatCurrency(remainingAmount)}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-slate-850">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      selectedDebt.direction === "RECEIVABLE" ? "bg-green-500" : "bg-purple-500"
                    }`}
                  />
                </div>
                <div className="flex justify-end text-[9px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                  {progressPercent}% Settled
                </div>
              </div>
            </div>

            {/* Content Splitter */}
            <div className="space-y-5">
              {/* Payment History Sub-Table */}
              <div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">
                  <History className="h-3.5 w-3.5" />
                  <span>Transaction History</span>
                </div>

                {selectedDebt.transactions.length > 0 ? (
                  <div className="border border-slate-800 rounded-lg overflow-hidden max-h-36 overflow-y-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-850 bg-slate-950/20 text-slate-500 font-medium">
                          <th className="py-2 px-2.5">Date</th>
                          <th className="py-2 px-2.5">Method</th>
                          <th className="py-2 px-2.5 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/50">
                        {selectedDebt.transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-800/10">
                            <td className="py-2 px-2.5 text-slate-400 flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 text-slate-650 shrink-0 text-slate-500" />
                              <span>{formatDate(tx.transactionDate)}</span>
                            </td>
                            <td className="py-2 px-2.5 text-slate-400">
                              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px]">
                                {tx.paymentMethod}
                              </span>
                            </td>
                            <td className="py-2 px-2.5 text-right font-semibold text-slate-300 font-mono">
                              {formatCurrency(tx.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-2.5 bg-slate-950/20 border border-slate-850/30 rounded-lg">
                    No transactions recorded for this account.
                  </p>
                )}
              </div>

              {/* Payoff Action Form */}
              <div className="border-t border-slate-800/60 pt-4">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Record Payoff Transaction</span>
                </div>
                <DebtPaymentForm
                  debtId={selectedDebt.id}
                  remainingAmount={remainingAmount.toString()}
                  disabled={remainingAmount <= 0 || selectedDebt.status === "PAID"}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
