"use server";

// Updated Lead Schema with Category & Venue Fields
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { generateLeadNumber, serializeLead } from "@/lib/repositories/leads";
import { LeadStatus, LeadPriority, LeadSource, FollowUpType } from "@prisma/client";

async function getValidProfileId(user: any, prisma: any): Promise<string | null> {
  if (!user || !user.id) return null;
  const existing = await prisma.profile.findUnique({ where: { id: user.id } });
  if (existing) return existing.id;

  if (user.email) {
    try {
      const created = await prisma.profile.create({
        data: {
          id: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || user.email.split("@")[0],
          role: "admin"
        }
      });
      return created.id;
    } catch {
      return null;
    }
  }

  return null;
}

export async function createLeadAction(formData: FormData) {
  const user = await getCurrentUser();
  const prisma = getPrisma();
  const profileId = await getValidProfileId(user, prisma);

  const name = formData.get("name") as string;
  const company = (formData.get("company") as string) || null;
  const email = (formData.get("email") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const source = (formData.get("source") as LeadSource) || "WEBSITE";
  const priority = (formData.get("priority") as LeadPriority) || "WARM";
  const category = (formData.get("category") as string) || "GENERAL";
  const venueType = (formData.get("venueType") as string) || null;
  const eventDateStr = formData.get("eventDate") as string;
  const eventDate = eventDateStr ? new Date(eventDateStr) : null;
  const eventLocation = (formData.get("eventLocation") as string) || null;
  const estimatedValueVal = formData.get("estimatedValue") as string;
  const estimatedValue = estimatedValueVal ? parseFloat(estimatedValueVal) : 0;
  const nextFollowUpDateStr = formData.get("nextFollowUpDate") as string;
  const nextFollowUpDate = nextFollowUpDateStr ? new Date(nextFollowUpDateStr) : null;
  const notes = (formData.get("notes") as string) || null;

  const leadNumber = await generateLeadNumber();

  const lead = await prisma.lead.create({
    data: {
      leadNumber,
      name: name && name.trim() !== "" ? name.trim() : "Inquiry",
      company: company?.trim() || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      source,
      priority,
      category,
      venueType: venueType?.trim() || null,
      eventDate,
      eventLocation: eventLocation?.trim() || null,
      estimatedValue,
      nextFollowUpDate,
      notes: notes?.trim() || null,
      createdById: profileId
    }
  });

  const initialSummary = notes && notes.trim() !== ""
    ? `Inquiry created (${source} / ${priority}). Notes: ${notes.trim()}`
    : `Inquiry created with source ${source} and priority ${priority}.`;

  // Log initial follow up
  await prisma.leadFollowUp.create({
    data: {
      leadId: lead.id,
      type: "NOTE",
      summary: initialSummary,
      createdById: profileId,
      nextActionDate: nextFollowUpDate
    }
  });

  revalidatePath("/leads");
  return { success: true, lead: serializeLead(lead) };
}

export async function updateLeadStatusAction(leadId: string, status: LeadStatus) {
  const user = await getCurrentUser();
  const prisma = getPrisma();
  const profileId = await getValidProfileId(user, prisma);

  const current = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!current) throw new Error("Lead not found");

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: { status }
  });

  await prisma.leadFollowUp.create({
    data: {
      leadId,
      type: "NOTE",
      summary: `Status updated from ${current.status.replace("_", " ")} to ${status.replace("_", " ")}.`,
      createdById: profileId
    }
  });

  revalidatePath("/leads");
  return { success: true, lead: serializeLead(updated) };
}

export async function addFollowUpAction(formData: FormData) {
  const user = await getCurrentUser();
  const prisma = getPrisma();
  const profileId = await getValidProfileId(user, prisma);

  const leadId = formData.get("leadId") as string;
  const type = (formData.get("type") as FollowUpType) || "NOTE";
  const summary = formData.get("summary") as string;
  const nextActionDateStr = formData.get("nextActionDate") as string;
  const nextActionDate = nextActionDateStr ? new Date(nextActionDateStr) : null;
  const newStatus = (formData.get("newStatus") as LeadStatus) || null;

  if (!leadId || !summary || summary.trim() === "") {
    throw new Error("Summary is required.");
  }

  const followUp = await prisma.leadFollowUp.create({
    data: {
      leadId,
      type,
      summary: summary.trim(),
      nextActionDate,
      createdById: profileId
    }
  });

  let updatedLead = null;
  if (newStatus || nextActionDate) {
    updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        ...(newStatus ? { status: newStatus } : {}),
        ...(nextActionDate ? { nextFollowUpDate: nextActionDate } : {})
      }
    });
  }

  revalidatePath("/leads");
  return {
    success: true,
    followUp: JSON.parse(JSON.stringify(followUp)),
    updatedLead: updatedLead ? serializeLead(updatedLead) : null
  };
}

export async function linkDocumentToLeadAction(leadId: string, docNumber: string) {
  const prisma = getPrisma();

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  const existingDocs = lead.linkedDocs || [];
  if (!existingDocs.includes(docNumber)) {
    const updatedDocs = [...existingDocs, docNumber];
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        linkedDocs: updatedDocs,
        // Auto-advance status if applicable
        ...(lead.status === "NEW_ENQUIRY" || lead.status === "CONTACTED" || lead.status === "REQUIREMENT_GATHERED"
          ? { status: "QUOTATION_SENT" as LeadStatus }
          : {})
      }
    });
  }

  revalidatePath("/leads");
  revalidatePath("/documents");
  return { success: true };
}

export async function deleteLeadAction(leadId: string) {
  const prisma = getPrisma();
  await prisma.lead.delete({ where: { id: leadId } });
  revalidatePath("/leads");
  return { success: true };
}

export async function updateLeadDetailsAction(leadId: string, formData: FormData) {
  const prisma = getPrisma();

  const name = formData.get("name") as string;
  const company = (formData.get("company") as string) || null;
  const email = (formData.get("email") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const priority = (formData.get("priority") as LeadPriority) || "WARM";
  const category = (formData.get("category") as string) || "ROBOTICS_EXPO";
  const venueType = (formData.get("venueType") as string) || null;
  const eventDateStr = formData.get("eventDate") as string;
  const eventDate = eventDateStr ? new Date(eventDateStr) : null;
  const eventLocation = (formData.get("eventLocation") as string) || null;
  const estimatedValueVal = formData.get("estimatedValue") as string;
  const estimatedValue = estimatedValueVal ? parseFloat(estimatedValueVal) : 0;
  const notes = (formData.get("notes") as string) || null;

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: {
      name: name && name.trim() !== "" ? name.trim() : "Inquiry",
      company: company?.trim() || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      priority,
      category,
      venueType: venueType?.trim() || null,
      eventDate,
      eventLocation: eventLocation?.trim() || null,
      estimatedValue,
      notes: notes?.trim() || null
    }
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  return { success: true, lead: serializeLead(updated) };
}
