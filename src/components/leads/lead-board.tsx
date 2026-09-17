"use client";

import { useState } from "react";
import Link from "next/link";
import { SerializedLead } from "@/lib/repositories/leads";
import { updateLeadStatusAction, addFollowUpAction, deleteLeadAction } from "@/lib/actions/leads";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LeadStatus, LeadPriority, LeadSource, FollowUpType } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  List,
  Search,
  Calendar,
  Building2,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Plus,
  ExternalLink,
  Trash2,
  MessageSquare,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  MessageCircle,
  User,
  Tag,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  Layers,
  Check
} from "lucide-react";

type LeadBoardProps = {
  leads: SerializedLead[];
};

const STAGES: { id: LeadStatus; label: string; color: string; border: string; bg: string; dotBg: string }[] = [
  { id: "NEW_ENQUIRY", label: "New Inquiry", color: "text-sky-700", border: "border-sky-200", bg: "bg-sky-50", dotBg: "bg-sky-500" },
  { id: "CONTACTED", label: "Contacted", color: "text-cyan-700", border: "border-cyan-200", bg: "bg-cyan-50", dotBg: "bg-cyan-500" },
  { id: "REQUIREMENT_GATHERED", label: "Requirements", color: "text-purple-700", border: "border-purple-200", bg: "bg-purple-50", dotBg: "bg-purple-500" },
  { id: "QUOTATION_SENT", label: "Quote Sent", color: "text-amber-800", border: "border-amber-200", bg: "bg-amber-50", dotBg: "bg-amber-500" },
  { id: "NEGOTIATION", label: "Negotiation", color: "text-indigo-700", border: "border-indigo-200", bg: "bg-indigo-50", dotBg: "bg-indigo-500" },
  { id: "WON", label: "Won Deal 🎉", color: "text-emerald-700", border: "border-emerald-200", bg: "bg-emerald-50", dotBg: "bg-emerald-500" },
  { id: "LOST", label: "Closed / Lost", color: "text-rose-700", border: "border-rose-200", bg: "bg-rose-50", dotBg: "bg-rose-500" }
];

const SOURCE_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  WEBSITE: { label: "Website", bg: "bg-sky-50 border-sky-200/80", text: "text-sky-700" },
  WHATSAPP: { label: "WhatsApp", bg: "bg-emerald-50 border-emerald-200/80", text: "text-emerald-700" },
  INSTAGRAM: { label: "Instagram", bg: "bg-pink-50 border-pink-200/80", text: "text-pink-700" },
  PHONE: { label: "Phone Call", bg: "bg-blue-50 border-blue-200/80", text: "text-blue-700" },
  EMAIL: { label: "Email", bg: "bg-purple-50 border-purple-200/80", text: "text-purple-700" },
  EXHIBITION: { label: "Exhibition", bg: "bg-amber-50 border-amber-200/80", text: "text-amber-800" },
  REFERRAL: { label: "Referral", bg: "bg-teal-50 border-teal-200/80", text: "text-teal-700" },
  OTHER: { label: "Other", bg: "bg-slate-100 border-slate-200", text: "text-slate-600" }
};

export function LeadBoard({ leads }: LeadBoardProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"kanban" | "table" | "workspace">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [activeLead, setActiveLead] = useState<SerializedLead | null>(null);
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<SerializedLead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Integrated Form State
  const [formType, setFormType] = useState<FollowUpType>("CALL");
  const [formNewStatus, setFormNewStatus] = useState<string>("");
  const [formSummary, setFormSummary] = useState<string>("");

  const applyTemplate = (type: FollowUpType, status: string, templateText: string) => {
    setFormType(type);
    setFormNewStatus(status);
    setFormSummary(templateText);
  };

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchQuery === "" ||
      lead.leadNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.name && lead.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchQuery)) ||
      (lead.notes && lead.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === "ALL" || lead.status === selectedStatus;
    const matchesPriority = selectedPriority === "ALL" || lead.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await updateLeadStatusAction(leadId, newStatus);
      if (activeLead && activeLead.id === leadId) {
        setActiveLead({ ...activeLead, status: newStatus });
      }
      showToast("success", `Lead stage updated to ${newStatus.replace("_", " ")}`);
      router.refresh();
    } catch (err: any) {
      showToast("error", err.message || "Failed to update status");
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeLead) return;

    setIsSubmittingFollowUp(true);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    formData.append("leadId", activeLead.id);

    try {
      const res = await addFollowUpAction(formData);
      if (res.success && res.followUp) {
        const newEntry = {
          id: res.followUp.id,
          leadId: res.followUp.leadId,
          date: res.followUp.date ? new Date(res.followUp.date).toISOString() : new Date().toISOString(),
          type: res.followUp.type,
          summary: res.followUp.summary,
          nextActionDate: res.followUp.nextActionDate ? new Date(res.followUp.nextActionDate).toISOString() : null,
          createdById: res.followUp.createdById,
          createdAt: res.followUp.createdAt ? new Date(res.followUp.createdAt).toISOString() : new Date().toISOString()
        };

        setActiveLead((prev) =>
          prev
            ? {
                ...prev,
                ...(res.updatedLead ? { status: res.updatedLead.status } : {}),
                nextFollowUpDate: res.followUp.nextActionDate
                  ? new Date(res.followUp.nextActionDate).toISOString()
                  : prev.nextFollowUpDate,
                followUps: [...(prev.followUps || []), newEntry]
              }
            : null
        );

        setFormSummary("");
        setFormNewStatus("");
        setFormType("CALL");
        showToast("success", "Activity logged & pipeline stage updated!");
        router.refresh();
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to add follow up log");
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLeadAction(leadToDelete.id);
      if (activeLead?.id === leadToDelete.id) setActiveLead(null);
      showToast("info", `Lead ${leadToDelete.leadNumber} deleted successfully.`);
      setLeadToDelete(null);
      router.refresh();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete lead.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getCleanPhone = (phone?: string | null) => {
    if (!phone) return "";
    return phone.replace(/[^\d+]/g, "");
  };

  return (
    <div className="space-y-6">
      {/* Visual Pipeline Health Distribution Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-extrabold text-slate-900">Live Sales Pipeline Overview</span>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {leads.length} Total Inquiries
          </span>
        </div>

        {/* Pipeline Multi-Segment Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-200">
          {STAGES.map((s) => {
            const count = leads.filter((l) => l.status === s.id).length;
            const pct = leads.length > 0 ? (count / leads.length) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={s.id}
                style={{ width: `${pct}%` }}
                className={`h-full ${s.dotBg} transition-all duration-300 rounded-sm`}
                title={`${s.label}: ${count} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* Clickable Stage Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setSelectedStatus("ALL")}
            className={`text-xs px-3 py-1 rounded-xl font-bold border transition ${
              selectedStatus === "ALL"
                ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                : "bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            All Stages ({leads.length})
          </button>
          {STAGES.map((s) => {
            const count = leads.filter((l) => l.status === s.id).length;
            const isSelected = selectedStatus === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedStatus(isSelected ? "ALL" : s.id)}
                className={`text-xs px-3 py-1 rounded-xl font-semibold border transition flex items-center gap-1.5 ${
                  isSelected
                    ? `${s.bg} ${s.border} ${s.color} shadow-sm font-bold ring-1 ring-indigo-500/20`
                    : "bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${s.dotBg}`} />
                <span>{s.label}</span>
                <span className="text-[10px] font-bold font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls Bar: Search & View Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Lead ID, Client, Company, Phone, or Notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition"
          />
        </div>

        {/* Priority Filter & View Mode */}
        <div className="flex items-center gap-3">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:bg-white focus:border-indigo-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="HOT">🔥 Hot Deal</option>
            <option value="WARM">⚡ Warm Deal</option>
            <option value="COLD">❄️ Cold Deal</option>
          </select>

          <div className="flex items-center bg-slate-100 p-1 border border-slate-200 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === "kanban" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === "table" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            {activeLead && (
              <button
                onClick={() => setViewMode("workspace")}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "workspace" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Workspace</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Board Area / Table / Workspace */}
      {viewMode === "workspace" && activeLead ? (
        /* SPLIT-SCREEN WORKSPACE VIEW: Left Navigator + Right Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDEBAR: Lead Navigator List (~320px) */}
          <div className="lg:col-span-4 xl:col-span-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3 lg:sticky lg:top-4 max-h-[calc(100vh-100px)] flex flex-col">
            {/* Top Header & Back to Kanban Button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <button
                onClick={() => {
                  setActiveLead(null);
                  setViewMode("kanban");
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Board</span>
              </button>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                {filteredLeads.length} Inquiries
              </span>
            </div>

            {/* Mini Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Scrollable Lead List Navigator */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredLeads.map((l) => {
                const isSelected = activeLead.id === l.id;
                const stage = STAGES.find((s) => s.id === l.status);
                return (
                  <div
                    key={l.id}
                    onClick={() => setActiveLead(l)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-mono font-bold ${isSelected ? "text-indigo-700" : "text-slate-600"}`}>
                        {l.leadNumber}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${stage?.bg} ${stage?.color} ${stage?.border}`}>
                        {stage?.label}
                      </span>
                    </div>
                    <h4 className={`text-xs font-bold truncate ${isSelected ? "text-indigo-950" : "text-slate-900"}`}>
                      {l.name || "Inquiry (No Name)"}
                    </h4>
                    {l.company && <p className="text-[10px] text-slate-500 truncate">{l.company}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT WORKSPACE: Detailed Lead Workspace Panel */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Lead Title & Quick Action Header Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                  {(activeLead.name || "I").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                      {activeLead.leadNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Source: {activeLead.source}
                    </span>
                    {activeLead.priority && (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        {activeLead.priority} Priority
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{activeLead.name || "Inquiry (No Name)"}</h2>
                  {activeLead.company && <p className="text-xs text-slate-500 font-medium mt-0.5">{activeLead.company}</p>}
                </div>
              </div>

              {/* Quick Communication & Document CTAs */}
              <div className="flex items-center gap-2 flex-wrap">
                {getCleanPhone(activeLead.phone) && (
                  <a
                    href={`https://wa.me/${getCleanPhone(activeLead.phone).replace("+", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {activeLead.phone && (
                  <a
                    href={`tel:${activeLead.phone}`}
                    className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call</span>
                  </a>
                )}
                <Link
                  href={`/documents?leadId=${activeLead.id}&leadNumber=${activeLead.leadNumber}&recipientName=${encodeURIComponent(activeLead.name || "")}&recipientOrg=${encodeURIComponent(activeLead.company || "")}`}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  <span>Raise Quotation</span>
                </Link>
                <button
                  onClick={() => setLeadToDelete(activeLead)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition cursor-pointer"
                  title="Delete Lead"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Interactive Pipeline Stage Tracker Bar */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pipeline Stage Progression</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {STAGES.map((s) => {
                  const isCurrent = activeLead.status === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleStatusChange(activeLead.id, s.id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? `${s.bg} ${s.border} ${s.color} shadow-sm ring-2 ring-indigo-500/20`
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {isCurrent && <Check className="h-3.5 w-3.5 shrink-0" />}
                      <span className="truncate">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2-Column Workspace Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Left Column: Requirements, Contact & Linked Docs */}
              <div className="space-y-6">
                {/* HIGH-VISIBILITY INITIAL REQUIREMENTS & NOTES SECTION */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Initial Inquiry Requirements & Notes
                    </h3>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl text-xs text-slate-800 font-medium leading-relaxed">
                    {activeLead.notes ? (
                      <p className="whitespace-pre-wrap">{activeLead.notes}</p>
                    ) : (
                      <p className="text-slate-400 italic">No initial requirement details logged during creation.</p>
                    )}
                  </div>
                </div>

                {/* Client Financials & Meta Details */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Financial & Contact Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Estimated Deal Value</p>
                      <p className="text-base font-extrabold text-slate-900 mt-0.5">{formatCurrency(activeLead.estimatedValue.toString())}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Lead Priority</p>
                      <p className="text-sm font-bold text-indigo-700 mt-0.5">{activeLead.priority || "NORMAL"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{activeLead.phone || "Not provided"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{activeLead.email || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                {/* Linked Documents Section */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      <span>Linked Quotations & Invoices</span>
                    </h3>
                    <span className="text-[10px] text-indigo-700 font-mono bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                      {activeLead.linkedDocs.length} Docs
                    </span>
                  </div>

                  {activeLead.linkedDocs.length > 0 ? (
                    <div className="space-y-2">
                      {activeLead.linkedDocs.map((docNum) => (
                        <div key={docNum} className="flex items-center justify-between bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs">
                          <span className="font-mono font-bold text-indigo-700">{docNum}</span>
                          <Link href="/documents" className="text-slate-600 hover:text-indigo-600 font-semibold text-xs flex items-center gap-1">
                            <span>Open in Document Studio</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No quotation or invoice raised for this lead yet.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Activity Logger & Chronological Timeline */}
              <div className="space-y-6">
                {/* Add Follow-up Log Form */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-indigo-600" />
                      <span>Log Activity & Advance Pipeline</span>
                    </h3>
                    <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                      Unified Action
                    </span>
                  </div>

                  <form onSubmit={handleAddFollowUp} className="space-y-4">
                    {/* Selectors Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Activity Type
                        </label>
                        <select
                          name="type"
                          value={formType}
                          onChange={(e) => setFormType(e.target.value as FollowUpType)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                        >
                          <option value="CALL">📞 Phone Call</option>
                          <option value="WHATSAPP">💬 WhatsApp</option>
                          <option value="MEETING">📅 Meeting</option>
                          <option value="EMAIL">✉️ Email</option>
                          <option value="NOTE">📝 Note</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Advance Stage To
                        </label>
                        <select
                          name="newStatus"
                          value={formNewStatus}
                          onChange={(e) => setFormNewStatus(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-indigo-700 font-bold focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Keep current ({STAGES.find((s) => s.id === activeLead.status)?.label})</option>
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              Advance ➔ {s.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Next Reminder
                        </label>
                        <input
                          name="nextActionDate"
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Quick Journey Story Shortcuts */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Journey Story Shortcuts</p>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => applyTemplate("CALL", "CONTACTED", "Called client to introduce services & gather scope details.")}
                          className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sky-700 font-semibold transition cursor-pointer"
                        >
                          📞 Contacted Client
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTemplate("CALL", "REQUIREMENT_GATHERED", "Conducted detailed requirement gathering call.")}
                          className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-purple-700 font-semibold transition cursor-pointer"
                        >
                          📋 Requirements Gathered
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTemplate("EMAIL", "QUOTATION_SENT", "Sent official quotation & project proposal via email.")}
                          className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-amber-800 font-semibold transition cursor-pointer"
                        >
                          📄 Sent Quotation
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTemplate("CALL", "NEGOTIATION", "Discussed pricing discounts & payment terms negotiation.")}
                          className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-indigo-700 font-semibold transition cursor-pointer"
                        >
                          🤝 Price Negotiation
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTemplate("NOTE", "WON", "Client approved quote & deal won! Advance to active production.")}
                          className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-emerald-700 font-bold transition cursor-pointer"
                        >
                          🎉 Deal Won!
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTemplate("NOTE", "LOST", "Client passed due to budget / competitor preference.")}
                          className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-rose-700 font-bold transition cursor-pointer"
                        >
                          ❄️ Deal Lost
                        </button>
                      </div>
                    </div>

                    {/* Summary Input */}
                    <div>
                      <textarea
                        required
                        name="summary"
                        value={formSummary}
                        onChange={(e) => setFormSummary(e.target.value)}
                        rows={2}
                        placeholder="Log conversation summary, requirements or agreement..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingFollowUp}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingFollowUp ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>Logging & Advancing Stage...</span>
                        </>
                      ) : (
                        <span>Save Activity & Update Pipeline Journey</span>
                      )}
                    </button>
                  </form>
                </div>

                {/* Activity Timeline (Chronological Journey) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-600" />
                      <span>Lead Journey Timeline (Chronological)</span>
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">Top (Start) → Bottom (Latest)</span>
                  </div>

                  <div className="space-y-4 border-l-2 border-slate-200 pl-4 relative">
                    {/* Step 1: Highlighted Initial Requirement Note at Top */}
                    {activeLead.notes && (
                      <div className="relative group">
                        <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-indigo-600 border-2 border-white shadow-xs" />
                        <div className="bg-indigo-50/60 border border-indigo-200/80 p-3.5 rounded-2xl space-y-1 shadow-xs">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-indigo-600" />
                              <span>1. Initial Requirement Note</span>
                            </span>
                            <span className="text-slate-500 font-mono">{formatDate(activeLead.createdAt.toString())}</span>
                          </div>
                          <p className="text-xs text-slate-800 font-medium leading-relaxed italic">"{activeLead.notes}"</p>
                        </div>
                      </div>
                    )}

                    {/* Subsequent Follow-up Logs */}
                    {activeLead.followUps.map((log, index) => {
                      const stepNum = (activeLead.notes ? 2 : 1) + index;
                      const isLatest = index === activeLead.followUps.length - 1;

                      return (
                        <div key={log.id} className="relative group">
                          <div
                            className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white transition ${
                              isLatest ? "bg-emerald-500 ring-2 ring-emerald-500/20" : "bg-slate-400 group-hover:bg-indigo-600"
                            }`}
                          />
                          <div
                            className={`p-3.5 rounded-2xl space-y-1 shadow-xs transition ${
                              isLatest
                                ? "bg-emerald-50/60 border border-emerald-200"
                                : "bg-slate-50 border border-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                                <span>Step {stepNum} • {log.type}</span>
                                {isLatest && (
                                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded text-[9px] font-bold">
                                    Latest Activity
                                  </span>
                                )}
                              </span>
                              <span className="text-slate-400 font-mono">{formatDate(log.date.toString())}</span>
                            </div>
                            <p className="text-xs text-slate-800 font-medium leading-relaxed">{log.summary}</p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Journey Active End Indicator */}
                    <div className="pt-2 flex items-center gap-2 text-[10px] text-slate-500 italic">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                      <span>Lead journey active — newly added notes will appear here at the bottom.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : viewMode === "kanban" ? (
        /* Kanban Pipeline Board View (Horizontal Scrolling Lanes) */
        <div className="flex gap-4 overflow-x-auto pb-4 items-start w-full min-h-[600px]">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage.id);
            const stageTotal = stageLeads.reduce((acc, l) => acc + (parseFloat(l.estimatedValue) || 0), 0);

            return (
              <div
                key={stage.id}
                className={`bg-slate-100/80 border border-slate-200/90 rounded-2xl p-3.5 flex flex-col w-[320px] shrink-0 shadow-2xs border-t-4 ${
                  stage.id === "NEW_ENQUIRY"
                    ? "border-t-sky-500"
                    : stage.id === "CONTACTED"
                    ? "border-t-cyan-500"
                    : stage.id === "REQUIREMENT_GATHERED"
                    ? "border-t-purple-500"
                    : stage.id === "QUOTATION_SENT"
                    ? "border-t-amber-500"
                    : stage.id === "NEGOTIATION"
                    ? "border-t-indigo-600"
                    : stage.id === "WON"
                    ? "border-t-emerald-500"
                    : "border-t-rose-500"
                }`}
              >
                {/* Stage Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${stage.dotBg}`} />
                      <span className={`text-xs font-extrabold ${stage.color}`}>{stage.label}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${stage.bg} ${stage.color} border ${stage.border}`}>
                        {stageLeads.length}
                      </span>
                    </div>
                    {stageTotal > 0 && (
                      <p className="text-[10px] font-mono font-bold text-slate-500 mt-1">
                        Total: {formatCurrency(stageTotal.toString())}
                      </p>
                    )}
                  </div>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 min-h-[180px]">
                  {stageLeads.map((lead) => {
                    const sourceBadge = SOURCE_BADGES[lead.source] || SOURCE_BADGES.OTHER;
                    const cleanPhone = getCleanPhone(lead.phone);

                    return (
                      <div
                        key={lead.id}
                        onClick={() => router.push(`/leads/${lead.id}`)}
                        className="bg-white border border-slate-200/90 hover:border-indigo-400 rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 group relative flex flex-col justify-between"
                      >
                        {/* Top Meta Line */}
                        <div className="flex items-center justify-between gap-1 mb-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-extrabold tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                              {lead.leadNumber}
                            </span>
                            {/* Lead Category Badge */}
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                              <span>
                                {lead.category === "ROBOTICS_EXPO" ? "🤖 Expo" : lead.category === "ROBOTICS_LAB" ? "🔬 Lab" : lead.category === "ELECTRONIC_COMPONENTS" ? "⚡ Components" : lead.category === "COLLEGE_PROJECT" ? "🎓 College Project" : "💼 General"}
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border ${sourceBadge.bg} ${sourceBadge.text}`}>
                              {sourceBadge.label}
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setLeadToDelete(lead);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                              title="Delete Lead"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Contact Info */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                              {(lead.name || "I").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                                {lead.name || "Inquiry (No Name)"}
                              </h4>
                              {lead.company && (
                                <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
                                  <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span>{lead.company}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* EVENT & VENUE TAG IF AVAILABLE */}
                          {(lead.eventLocation || lead.venueType) && (
                            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-700 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg">
                              <span className="shrink-0">📍</span>
                              <span className="truncate">{lead.eventLocation || lead.venueType}</span>
                              {lead.eventDate && (
                                <span className="font-mono text-[9.5px] text-slate-500 shrink-0">
                                  ({new Date(lead.eventDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })})
                                </span>
                              )}
                            </div>
                          )}

                          {/* PROMINENT INITIAL NOTES / REQUIREMENT BOX */}
                          {lead.notes ? (
                            <div className="bg-slate-50 border-l-3 border-indigo-500 p-2 rounded-r-xl text-xs text-slate-700 line-clamp-2 italic shadow-2xs">
                              <span className="font-bold text-indigo-600 not-italic mr-1">Req:</span>
                              {lead.notes}
                            </div>
                          ) : (
                            <div className="bg-slate-50 border border-dashed border-slate-200 p-2 rounded-xl text-[11px] text-slate-400 italic">
                              No requirement notes logged
                            </div>
                          )}
                        </div>

                        {/* Quick 1-Click Move Stage Dropdown */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                          <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Est. Value</p>
                            <p className="font-extrabold text-slate-900">{formatCurrency(lead.estimatedValue.toString())}</p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Fast Stage Switcher */}
                            <select
                              value={lead.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleStatusChange(lead.id, e.target.value as LeadStatus);
                              }}
                              className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                              {STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  Stage: {s.label}
                                </option>
                              ))}
                            </select>

                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone.replace("+", "")}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {stageLeads.length === 0 && (
                    <div className="h-28 border border-dashed border-slate-200/90 rounded-2xl flex flex-col items-center justify-center text-center p-3">
                      <span className="text-[11px] text-slate-400 font-medium">No leads in {stage.label}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Default Executive Table View */
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                <th className="py-4 px-4">Lead ID</th>
                <th className="py-4 px-4">Client & Company</th>
                <th className="py-4 px-4">Category & Venue</th>
                <th className="py-4 px-4">Initial Requirements</th>
                <th className="py-4 px-4">Source</th>
                <th className="py-4 px-4">Pipeline Stage</th>
                <th className="py-4 px-4">Est. Value</th>
                <th className="py-4 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLeads.map((lead) => {
                const stageInfo = STAGES.find((s) => s.id === lead.status);
                const sourceBadge = SOURCE_BADGES[lead.source] || SOURCE_BADGES.OTHER;
                return (
                  <tr
                    key={lead.id}
                    onClick={() => router.push(`/leads/${lead.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{lead.leadNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{lead.name || "Inquiry"}</div>
                      {lead.company && <div className="text-[11px] text-slate-500 mt-0.5">{lead.company}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                          {lead.category === "ROBOTICS_EXPO" ? "🤖 Expo" : lead.category === "ROBOTICS_LAB" ? "🔬 Lab" : lead.category === "ELECTRONIC_COMPONENTS" ? "⚡ Components" : lead.category === "COLLEGE_PROJECT" ? "🎓 Project" : "💼 General"}
                        </span>
                        {lead.eventLocation && (
                          <span className="text-[10px] text-slate-600 font-medium">📍 {lead.eventLocation}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      {lead.notes ? (
                        <p className="text-slate-700 truncate italic">{lead.notes}</p>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-semibold border ${sourceBadge.bg} ${sourceBadge.text}`}>
                        {sourceBadge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border cursor-pointer ${stageInfo?.bg} ${stageInfo?.color} ${stageInfo?.border} focus:outline-none`}
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {formatCurrency(lead.estimatedValue.toString())}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Lead</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLeadToDelete(lead);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Premium Floating Notification Toast Bar */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-6 fade-in duration-200">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-xl text-xs font-bold ${
              toast.type === "success"
                ? "bg-white border-emerald-300 text-emerald-800 shadow-emerald-500/10"
                : toast.type === "error"
                ? "bg-white border-rose-300 text-rose-800 shadow-rose-500/10"
                : "bg-white border-indigo-300 text-indigo-800 shadow-indigo-500/10"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
            {toast.type === "error" && <XCircle className="h-4 w-4 text-rose-600 shrink-0" />}
            {toast.type === "info" && <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <XCircle className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Premium Delete Confirmation Modal */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Lead Record</h3>
                <p className="text-xs text-slate-500 font-mono">{leadToDelete.leadNumber}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete lead <strong className="text-slate-900 font-bold">{leadToDelete.name || leadToDelete.leadNumber}</strong>? This action cannot be undone.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteLead}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md disabled:opacity-50 transition flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Permanently</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
