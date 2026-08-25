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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <PlusCircle className="h-5 w-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-slate-100">Add Account</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Person Name */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Person / Organization Name
          </label>
          <input
            type="text"
            name="personName"
            required
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="e.g. Supplier XYZ, John Doe"
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-slate-100 rounded-lg py-2 px-3 text-sm focus:outline-none transition"
          />
        </div>

        {/* Direction Toggle (Receivable vs. Payable) */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDirection("RECEIVABLE")}
              className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                direction === "RECEIVABLE"
                  ? "bg-green-500/10 border-green-500 text-green-400 shadow-md shadow-green-500/5"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              Debtor (Get Money)
            </button>
            <button
              type="button"
              onClick={() => setDirection("PAYABLE")}
              className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                direction === "PAYABLE"
                  ? "bg-purple-500/10 border-purple-500 text-purple-400 shadow-md shadow-purple-500/5"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              Creditor (Give Money)
            </button>
          </div>
        </div>

        {/* Original Amount & Already Paid Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
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
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-slate-100 rounded-lg py-2 px-3 text-sm focus:outline-none transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Already Paid (Optional)
            </label>
            <input
              type="number"
              name="paidAmount"
              min="0"
              step="any"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder="e.g. 40000"
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-slate-100 rounded-lg py-2 px-3 text-sm focus:outline-none transition"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Notes / Description (Optional)
          </label>
          <input
            type="text"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reason for debt, terms..."
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-slate-100 rounded-lg py-2 px-3 text-sm focus:outline-none transition"
          />
        </div>

        {/* Status Message */}
        {state?.message && (
          <div
            className={`p-3 rounded-lg text-xs font-medium border ${
              state.ok
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {state.message}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-900 hover:scale-[1.01] active:scale-[0.99] transition-all font-semibold text-sm py-2.5 shadow-md shadow-cyan-500/10"
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
