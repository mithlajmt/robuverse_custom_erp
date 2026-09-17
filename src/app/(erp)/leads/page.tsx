import { requireUser } from "@/lib/auth/session";
import { getLeads, getLeadsSummary } from "@/lib/repositories/leads";
import { formatCurrency } from "@/lib/utils";
import { CreateLeadModal } from "@/components/leads/lead-form-modal";
import { LeadBoard } from "@/components/leads/lead-board";
import { Target, TrendingUp, Trophy, Clock, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  await requireUser();

  const [summary, rawLeads] = await Promise.all([
    getLeadsSummary(),
    getLeads()
  ]);

  const leads = JSON.parse(JSON.stringify(rawLeads));

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest">
            <Target className="h-4 w-4 text-indigo-600" />
            <span>Robuverse Agency CRM</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Lead Management System
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Track inquiries with unique Lead IDs, log follow-ups, and convert leads into Quotations & Invoices.
          </p>
        </div>

        <div>
          <CreateLeadModal />
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {/* Total Inquiries */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 relative overflow-hidden group shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Total Leads</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{summary.totalLeads}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Active customer inquiries</p>
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 relative overflow-hidden group shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Pipeline Value</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(summary.pipelineValue)}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Active deal pipeline</p>
          </div>
        </div>

        {/* Won Value */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 relative overflow-hidden group shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Won Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(summary.wonValue)}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Converted deal value</p>
          </div>
        </div>

        {/* Overdue Followups */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 relative overflow-hidden group shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Follow-up Alerts</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{summary.overdueFollowUps}</p>
            <p className="text-[10px] text-rose-600 font-semibold mt-1">Overdue follow-up reminders</p>
          </div>
        </div>
      </div>

      {/* Main Board */}
      <LeadBoard leads={leads} />
    </div>
  );
}
