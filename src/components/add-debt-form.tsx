"use client";

import { useActionState, startTransition, useState } from "react";
import { createDebt } from "@/lib/actions/debts";
import { PlusCircle, Loader2 } from "lucide-react";
import { DebtDirection } from "@prisma/client";

export function AddDebtForm() {
  const [state, formAction, isPending] = useActionState(createDebt, {
    ok: false,
    message: ""
  });

  const [personName, setPersonName] = useState("");
  const [direction, setDirection] = useState<DebtDirection>("RECEIVABLE");
  const [amount, setAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("0");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("direction", direction);

    startTransition(() => {
      formAction(formData);
    });

    if (state?.ok) {
      setPersonName("");
      setAmount("");
      setPaidAmount("0");
      setNotes("");
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <PlusCircle className="h-5 w-5 text-indigo-600" />
        <h2 className="text-base font-extrabold text-slate-900">Add Account</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Person Name */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Person / Organization Name
          </label>
          <input
            type="text"
            name="personName"
            required
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="e.g. Supplier XYZ, John Doe"
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-900 rounded-xl py-2.5 px-3.5 text-xs font-medium focus:outline-none transition"
          />
        </div>

        {/* Direction Toggle (Receivable vs. Payable) */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDirection("RECEIVABLE")}
              className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                direction === "RECEIVABLE"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Debtor (Get Money)
            </button>
            <button
              type="button"
              onClick={() => setDirection("PAYABLE")}
              className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                direction === "PAYABLE"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Creditor (Give Money)
            </button>
          </div>
        </div>

        {/* Original Amount & Already Paid Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Total Amount
            </label>
            <input
              type="number"
              name="amount"
              required
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 100000"
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-900 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none transition"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Already Paid
            </label>
            <input
              type="number"
              name="paidAmount"
              min="0"
              step="any"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder="e.g. 40000"
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-900 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none transition"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Notes / Description (Optional)
          </label>
          <input
            type="text"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reason for debt, terms..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-900 rounded-xl py-2.5 px-3.5 text-xs font-medium focus:outline-none transition"
          />
        </div>

        {/* Status Message */}
        {state?.message && (
          <div
            className={`p-3 rounded-xl text-xs font-bold border ${
              state.ok
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {state.message}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 shadow-md shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>
    </div>
  );
}
