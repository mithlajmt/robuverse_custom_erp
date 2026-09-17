"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SerializedLead } from "@/lib/repositories/leads";
import { updateLeadStatusAction, addFollowUpAction, deleteLeadAction, updateLeadDetailsAction } from "@/lib/actions/leads";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LeadStatus, FollowUpType } from "@prisma/client";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Check,
  FileText,
  ExternalLink,
  Trash2,
  MessageSquare,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Plus,
  User,
  DollarSign,
  Calendar,
  Building2,
  Pencil,
  X
} from "lucide-react";

type LeadDetailWorkspaceProps = {
  initialLead: SerializedLead;
};

const STAGES: { id: LeadStatus; label: string; step: number }[] = [
  { id: "NEW_ENQUIRY", label: "New Inquiry", step: 1 },
  { id: "CONTACTED", label: "Contacted", step: 2 },
  { id: "REQUIREMENT_GATHERED", label: "Requirements", step: 3 },
  { id: "QUOTATION_SENT", label: "Quote Sent", step: 4 },
  { id: "NEGOTIATION", label: "Negotiation", step: 5 },
  { id: "WON", label: "Won Deal 🎉", step: 6 },
  { id: "LOST", label: "Closed / Lost", step: 7 }
];

function getCleanPhone(phone: string | null): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9+]/g, "");
  if (!cleaned.startsWith("+") && cleaned.length === 10) {
    cleaned = "+91" + cleaned;
  }
  return cleaned;
}

export function LeadDetailWorkspace({ initialLead }: LeadDetailWorkspaceProps) {
  const router = useRouter();
  const [activeLead, setActiveLead] = useState<SerializedLead>(initialLead);
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<SerializedLead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [isSavingLead, setIsSavingLead] = useState(false);

  // Form State
  const [formType, setFormType] = useState<FollowUpType>("CALL");
  const [formNewStatus, setFormNewStatus] = useState<string>("");
  const [formSummary, setFormSummary] = useState<string>("");

  const handleUpdateLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingLead(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateLeadDetailsAction(activeLead.id, formData);
      if (res.success && res.lead) {
        setActiveLead(res.lead);
        showToast("success", "Lead details updated successfully!");
        setIsEditingLead(false);
        router.refresh();
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to update lead details");
    } finally {
      setIsSavingLead(false);
    }
  };

  const applyQuickAction = (type: FollowUpType, status: string, summaryText: string) => {
    setFormType(type);
    setFormNewStatus(status);
    setFormSummary(summaryText);
  };

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await updateLeadStatusAction(leadId, newStatus);
      setActiveLead((prev) => ({ ...prev, status: newStatus }));
      showToast("success", `Pipeline stage updated to ${newStatus.replace("_", " ")}`);
      router.refresh();
    } catch (err: any) {
      showToast("error", err.message || "Failed to update stage");
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formSummary.trim()) {
      showToast("error", "Please write conversation details before saving.");
      return;
    }
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

        setActiveLead((prev) => ({
          ...prev,
          ...(res.updatedLead ? { status: res.updatedLead.status } : {}),
          nextFollowUpDate: res.followUp.nextActionDate
            ? new Date(res.followUp.nextActionDate).toISOString()
            : prev.nextFollowUpDate,
          followUps: [...(prev.followUps || []), newEntry]
        }));

        setFormSummary("");
        setFormNewStatus("");
        setFormType("CALL");
        showToast("success", "Activity logged & story updated!");
        router.refresh();
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to log activity");
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLeadAction(leadToDelete.id);
      showToast("success", `Lead ${leadToDelete.leadNumber} deleted successfully`);
      setLeadToDelete(null);
      router.push("/leads");
      router.refresh();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete lead");
    } finally {
      setIsDeleting(false);
    }
  };

  const cleanPhone = getCleanPhone(activeLead.phone);
  const currentStageIndex = STAGES.findIndex((s) => s.id === activeLead.status);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP ALL-IN-ONE EXECUTIVE HEADER BOX */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
        {/* Top Row: Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/leads"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl transition"
            >
              <ArrowLeft className="h-4 w-4 text-slate-500" />
              <span>Back to Leads Board</span>
            </Link>
            <span className="text-slate-300 font-bold">•</span>
            <span className="text-xs font-mono font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
              {activeLead.leadNumber}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
              Source: {activeLead.source}
            </span>
            <span
              className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                activeLead.priority === "HOT"
                  ? "bg-rose-100 text-rose-700 border border-rose-200"
                  : activeLead.priority === "WARM"
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              {activeLead.priority || "WARM"} Priority
            </span>
          </div>

          {/* Quick Communication & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone.replace("+", "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            )}
            {activeLead.phone && (
              <a
                href={`tel:${activeLead.phone}`}
                className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Phone className="h-4 w-4" />
                <span>Call</span>
              </a>
            )}
            {activeLead.email && (
              <a
                href={`mailto:${activeLead.email}`}
                className="inline-flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </a>
            )}
            <button
              onClick={() => setIsEditingLead(true)}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-extrabold px-3.5 py-2 rounded-xl text-xs border border-slate-200/80 transition cursor-pointer"
            >
              <Pencil className="h-4 w-4 text-indigo-600" />
              <span>Edit Details</span>
            </button>
            <Link
              href={`/documents?leadId=${activeLead.id}&leadNumber=${activeLead.leadNumber}&recipientName=${encodeURIComponent(activeLead.name || "")}&recipientOrg=${encodeURIComponent(activeLead.company || "")}`}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md shadow-indigo-500/20 transition"
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

        {/* Lead Title Banner */}
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeLead.name || "Inquiry (No Name)"}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Contact & Deal Overview Card
            </p>
          </div>
        </div>

        {/* KEY CONTACT & DEAL VALUES GRID (6 Metrics inside top box) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Contact Name */}
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <User className="h-3 w-3 text-indigo-600" />
              <span>Contact Name</span>
            </span>
            <p className="text-xs font-extrabold text-slate-900 truncate">
              {activeLead.name || "Not provided"}
            </p>
          </div>

          {/* 2. Company / Org */}
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="h-3 w-3 text-indigo-600" />
              <span>Company / Org</span>
            </span>
            <p className="text-xs font-extrabold text-slate-900 truncate">
              {activeLead.company || "Not provided"}
            </p>
          </div>

          {/* 3. Phone Number */}
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Phone className="h-3 w-3 text-indigo-600" />
              <span>Phone Number</span>
            </span>
            <p className="text-xs font-extrabold text-slate-900 truncate">
              {activeLead.phone ? (
                <a href={`tel:${activeLead.phone}`} className="hover:text-indigo-600 hover:underline">
                  {activeLead.phone}
                </a>
              ) : (
                <span className="text-slate-400 font-normal">Not provided</span>
              )}
            </p>
          </div>

          {/* 4. Email Address */}
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Mail className="h-3 w-3 text-indigo-600" />
              <span>Email Address</span>
            </span>
            <p className="text-xs font-extrabold text-slate-900 truncate">
              {activeLead.email ? (
                <a href={`mailto:${activeLead.email}`} className="hover:text-indigo-600 hover:underline">
                  {activeLead.email}
                </a>
              ) : (
                <span className="text-slate-400 font-normal">Not provided</span>
              )}
            </p>
          </div>

          {/* 5. Estimated Deal Value */}
          <div className="bg-indigo-50/60 border border-indigo-200/80 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-indigo-600" />
              <span>Est. Deal Value</span>
            </span>
            <p className="text-xs font-extrabold text-indigo-900 truncate">
              {formatCurrency(activeLead.estimatedValue.toString())}
            </p>
          </div>

          {/* 6. Inquiry Date */}
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3 text-indigo-600" />
              <span>Inquiry Date</span>
            </span>
            <p className="text-xs font-extrabold text-slate-800 truncate">
              {formatDate(activeLead.createdAt.toString())}
            </p>
          </div>
        </div>

        {/* LEAD CATEGORY & EVENT VENUE SPECIFICATIONS STRIP */}
        <div className="bg-gradient-to-r from-indigo-50/60 via-slate-50 to-blue-50/60 border border-indigo-100 rounded-xl p-3 relative group">
          <button
            onClick={() => setIsEditingLead(true)}
            className="absolute top-2.5 right-2.5 text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-white/90 hover:bg-white border border-indigo-200/80 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs"
            title="Edit Event, Place & Priority Specifications"
          >
            <Pencil className="h-3 w-3 text-indigo-600" />
            <span>Edit Event / Place</span>
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pr-28">
          {/* Category Badge */}
          <div className="flex items-center gap-2.5">
            <span className="text-lg">
              {activeLead.category === "ROBOTICS_EXPO" ? "🤖" : activeLead.category === "ROBOTICS_LAB" ? "🔬" : activeLead.category === "ELECTRONIC_COMPONENTS" ? "⚡" : activeLead.category === "COLLEGE_PROJECT" ? "🎓" : "💼"}
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Lead Category</span>
              <span className="font-extrabold text-indigo-950">
                {activeLead.category === "ROBOTICS_EXPO" ? "Robotics Expo / Event" : activeLead.category === "ROBOTICS_LAB" ? "Robotics Lab Setup" : activeLead.category === "ELECTRONIC_COMPONENTS" ? "Electronics Components" : activeLead.category === "COLLEGE_PROJECT" ? "College Project" : "General Business Inquiry"}
              </span>
            </div>
          </div>

          {/* Venue Type */}
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🏫</span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Venue / Institution</span>
              <span className="font-bold text-slate-800">
                {activeLead.venueType || "Standard / General Venue"}
              </span>
            </div>
          </div>

          {/* Event / Deployment Date */}
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📅</span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Event / Target Date</span>
              <span className="font-bold text-slate-800 font-mono">
                {activeLead.eventDate ? formatDate(activeLead.eventDate.toString()) : "Not Scheduled"}
              </span>
            </div>
          </div>

          {/* Event / Installation Location */}
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📍</span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Event / Venue Location</span>
              <span className="font-bold text-slate-800 truncate block max-w-[180px]">
                {activeLead.eventLocation || "Location Not Provided"}
              </span>
            </div>
          </div>
        </div>
      </div>

        {/* VISUAL CONNECTED PIPELINE STEPPER BAR */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pipeline Stage Progression</p>
            <p className="text-[11px] font-semibold text-slate-400">Click any stage button to advance status</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200/80">
            {STAGES.map((s, idx) => {
              const isActive = activeLead.status === s.id;
              const isPassed = idx < currentStageIndex;

              return (
                <button
                  key={s.id}
                  onClick={() => handleStatusChange(activeLead.id, s.id)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-center truncate ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 ring-2 ring-slate-900/20"
                      : isPassed
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {isActive ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  ) : isPassed ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  ) : (
                    <span className="text-[10px] opacity-60 font-mono">{idx + 1}.</span>
                  )}
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE (2 Balanced Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (60%): Requirements & Chronological Journey Story */}
        <div className="lg:col-span-7 space-y-6">
          {/* CHRONOLOGICAL LEAD JOURNEY TIMELINE */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Lead Journey Timeline</h2>
                  <p className="text-xs text-slate-500 font-mono">Chronological order: Step 1 (Top) ➔ Step N (Bottom)</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-l-2 border-slate-200 pl-4 relative">
              {/* Step 1: Initial Requirement Note */}
              {activeLead.notes && (
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-indigo-600 border-2 border-white shadow-xs" />
                  <div className="bg-indigo-50/70 border border-indigo-200/80 p-4 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Step 1 • Initial Requirement Note</span>
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">
                        {formatDate(activeLead.createdAt.toString())}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed italic">
                      "{activeLead.notes}"
                    </p>
                  </div>
                </div>
              )}

              {/* Subsequent Follow-up Logs */}
              {activeLead.followUps.map((log, index) => {
                const stepNum = (activeLead.notes ? 2 : 1) + index;
                const isLatest = index === activeLead.followUps.length - 1;

                return (
                  <div key={log.id} className="relative">
                    <div
                      className={`absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 border-white transition ${
                        isLatest ? "bg-emerald-500 ring-2 ring-emerald-500/20" : "bg-slate-400"
                      }`}
                    />
                    <div
                      className={`p-4 rounded-2xl space-y-1.5 transition ${
                        isLatest
                          ? "bg-emerald-50/70 border border-emerald-200 shadow-xs"
                          : "bg-slate-50 border border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <span>Step {stepNum} • {log.type}</span>
                          {isLatest && (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[9px] font-extrabold">
                              Latest Step
                            </span>
                          )}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {formatDate(log.date.toString())}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {log.summary}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 flex items-center gap-2 text-xs text-slate-400 font-medium italic">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Lead story active. New updates will be logged at the bottom.</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (40%): Activity Logger & Linked Documents */}
        <div className="lg:col-span-5 space-y-6">
          {/* QUICK ACTIVITY LOGGER & PIPELINE ADVANCER */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Log Activity & Advance Pipeline</h2>
                  <p className="text-xs text-slate-500">Record a call, meeting or update stage</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddFollowUp} className="space-y-4">
              {/* Quick Journey Shortcuts */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Quick Journey Story Shortcuts
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyQuickAction("CALL", "CONTACTED", "Called client to introduce services & gather scope details.")}
                    className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sky-700 font-semibold transition cursor-pointer"
                  >
                    📞 Contacted
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickAction("CALL", "REQUIREMENT_GATHERED", "Conducted detailed requirement gathering call.")}
                    className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-purple-700 font-semibold transition cursor-pointer"
                  >
                    📋 Requirements Gathered
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickAction("EMAIL", "QUOTATION_SENT", "Sent official quotation & proposal documents to client.")}
                    className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-amber-800 font-semibold transition cursor-pointer"
                  >
                    📄 Quote Sent
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickAction("CALL", "NEGOTIATION", "Discussed pricing & contract terms negotiation with client.")}
                    className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-indigo-700 font-semibold transition cursor-pointer"
                  >
                    🤝 Negotiation
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickAction("NOTE", "WON", "Client approved quote & deal won! Advance to active production.")}
                    className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-emerald-700 font-extrabold transition cursor-pointer"
                  >
                    🎉 Deal Won!
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickAction("NOTE", "LOST", "Client passed due to budget / competitor preference.")}
                    className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-rose-700 font-extrabold transition cursor-pointer"
                  >
                    ❄️ Deal Lost
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Log Conversation Summary / Agreement
                </label>
                <textarea
                  required
                  name="summary"
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  rows={3}
                  placeholder="Log conversation summary, requirements or agreement..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingFollowUp}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl text-xs shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingFollowUp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Saving Update...</span>
                  </>
                ) : (
                  <span>Save Activity & Update Pipeline Journey</span>
                )}
              </button>
            </form>
          </div>

          {/* LINKED QUOTATIONS & INVOICES CARD */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <span>Linked Quotations & Invoices</span>
              </h2>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                {activeLead.linkedDocs.length} Docs
              </span>
            </div>

            {activeLead.linkedDocs.length > 0 ? (
              <div className="space-y-2">
                {activeLead.linkedDocs.map((docNum) => (
                  <div key={docNum} className="flex items-center justify-between bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs">
                    <span className="font-mono font-bold text-indigo-700">{docNum}</span>
                    <Link href="/documents" className="text-slate-600 hover:text-indigo-600 font-semibold text-xs flex items-center gap-1">
                      <span>View in Document Studio</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 p-5 rounded-2xl text-center space-y-3">
                <p className="text-xs text-slate-400 italic">No quotation or invoice raised for this lead yet.</p>
                <Link
                  href={`/documents?leadId=${activeLead.id}&leadNumber=${activeLead.leadNumber}&recipientName=${encodeURIComponent(activeLead.name || "")}&recipientOrg=${encodeURIComponent(activeLead.company || "")}`}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-indigo-500/20 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Raise Quotation Now</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Notification Toast */}
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

      {/* Delete Confirmation Modal */}
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
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteLead}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md disabled:opacity-50 transition flex items-center gap-2 cursor-pointer"
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

      {/* Edit Lead Details Modal */}
      {isEditingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Edit Lead Specifications</h2>
                  <p className="text-xs text-slate-500 font-mono">Update event details, priority, venue & contact for {activeLead.leadNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingLead(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateLead} className="p-6 space-y-4 overflow-y-auto flex-1 bg-white">
              {/* Contact Name & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={activeLead.name || ""}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company / Organization
                  </label>
                  <input
                    name="company"
                    type="text"
                    defaultValue={activeLead.company || ""}
                    placeholder="e.g. Robuverse Tech"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={activeLead.email || ""}
                    placeholder="rahul@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone / WhatsApp
                  </label>
                  <input
                    name="phone"
                    type="text"
                    defaultValue={activeLead.phone || ""}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Priority, Deal Value & Lead Source */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lead Priority *
                  </label>
                  <select
                    name="priority"
                    defaultValue={activeLead.priority || "WARM"}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="HOT">🔥 HOT Priority</option>
                    <option value="WARM">⚡ WARM Priority</option>
                    <option value="COLD">❄️ COLD Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lead Source
                  </label>
                  <select
                    name="source"
                    defaultValue={activeLead.source || "WHATSAPP"}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="WEBSITE">Website</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="PHONE">Phone Call</option>
                    <option value="EMAIL">Email Inquiry</option>
                    <option value="EXPO">Expo / Event</option>
                    <option value="OTHER">Other Source</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Est. Deal Value (₹)
                  </label>
                  <input
                    name="estimatedValue"
                    type="number"
                    min="0"
                    step="any"
                    defaultValue={activeLead.estimatedValue}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Lead Category & Event Venue Details (Event Date & Place) */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-200/80 rounded-2xl space-y-3">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Category, Venue & Event Logistics</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Requirement Category *
                    </label>
                    <select
                      name="category"
                      defaultValue={activeLead.category || "ROBOTICS_EXPO"}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="ROBOTICS_EXPO">🤖 Robotics Expo / Event Demo</option>
                      <option value="ROBOTICS_LAB">🔬 Robotics Lab Setup</option>
                      <option value="ELECTRONIC_COMPONENTS">⚡ Electronics Components Supply</option>
                      <option value="COLLEGE_PROJECT">🎓 College / Student Project</option>
                      <option value="GENERAL">💼 General Business / Services</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Venue / Place Type
                    </label>
                    <select
                      name="venueType"
                      defaultValue={activeLead.venueType || ""}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">Not Specified / Standard</option>
                      <option value="School">🏫 School Place</option>
                      <option value="College">🎓 College / University Place</option>
                      <option value="Exhibition Hall">🎪 Exhibition / Convention Hall</option>
                      <option value="Corporate Office">🏢 Corporate Office</option>
                      <option value="Virtual / Online">💻 Virtual / Online</option>
                      <option value="Other">📍 Other Location</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      📅 Event / Target Date
                    </label>
                    <input
                      name="eventDate"
                      type="date"
                      defaultValue={
                        activeLead.eventDate
                          ? new Date(activeLead.eventDate).toISOString().split("T")[0]
                          : ""
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:border-indigo-500 focus:outline-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      📍 Event / Venue Location (Place of Event)
                    </label>
                    <input
                      name="eventLocation"
                      type="text"
                      defaultValue={activeLead.eventLocation || ""}
                      placeholder="e.g. Kochin Airport Exhibition Ground"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Initial Requirement Note */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Requirement Notes / Specifications
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={activeLead.notes || ""}
                  placeholder="Key inquiry requirements, products interested in, demo setup specs..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none resize-none transition"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingLead(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingLead}
                  className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer"
                >
                  {isSavingLead ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Save Lead Details</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
