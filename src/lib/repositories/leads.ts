import { getPrisma } from "@/lib/prisma";
import { LeadStatus, LeadPriority, LeadSource, FollowUpType, Prisma } from "@prisma/client";

export type SerializedLead = {
  id: string;
  leadNumber: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  category: string | null;
  venueType: string | null;
  eventDate: string | null;
  eventLocation: string | null;
  estimatedValue: string;
  enquiryDate: string;
  nextFollowUpDate: string | null;
  notes: string | null;
  assignedToId: string | null;
  linkedDocs: string[];
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  followUps: Array<{
    id: string;
    leadId: string;
    date: string;
    type: FollowUpType;
    summary: string;
    nextActionDate: string | null;
    createdById: string | null;
    createdAt: string;
    createdBy?: { fullName: string | null; email: string } | null;
  }>;
  assignedTo?: { fullName: string | null; email: string } | null;
};

export function serializeLead(lead: any): SerializedLead {
  const plainObj = {
    ...lead,
    category: lead.category || "GENERAL",
    venueType: lead.venueType || null,
    eventDate: lead.eventDate ? new Date(lead.eventDate).toISOString() : null,
    eventLocation: lead.eventLocation || null,
    estimatedValue: lead.estimatedValue ? lead.estimatedValue.toString() : "0",
    enquiryDate: lead.enquiryDate ? new Date(lead.enquiryDate).toISOString() : new Date().toISOString(),
    nextFollowUpDate: lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toISOString() : null,
    createdAt: lead.createdAt ? new Date(lead.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: lead.updatedAt ? new Date(lead.updatedAt).toISOString() : new Date().toISOString(),
    followUps: (lead.followUps || []).map((f: any) => ({
      ...f,
      date: f.date ? new Date(f.date).toISOString() : new Date().toISOString(),
      nextActionDate: f.nextActionDate ? new Date(f.nextActionDate).toISOString() : null,
      createdAt: f.createdAt ? new Date(f.createdAt).toISOString() : new Date().toISOString()
    }))
  };

  return JSON.parse(JSON.stringify(plainObj));
}

export async function generateLeadNumber(): Promise<string> {
  const prisma = getPrisma();
  const year = new Date().getFullYear();
  const prefix = `LEAD-${year}-`;

  const latestLead = await prisma.lead.findFirst({
    where: {
      leadNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      leadNumber: "desc"
    }
  });

  if (!latestLead) {
    return `${prefix}0001`;
  }

  const parts = latestLead.leadNumber.split("-");
  const lastNum = parseInt(parts[parts.length - 1] || "0", 10);
  const nextNum = (lastNum + 1).toString().padStart(4, "0");

  return `${prefix}${nextNum}`;
}

export async function getLeadsSummary() {
  const prisma = getPrisma();
  const now = new Date();

  const [totalLeads, pipelineAgg, wonAgg, overdueFollowUpsCount] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.aggregate({
      where: {
        status: {
          notIn: ["WON", "LOST"]
        }
      },
      _sum: {
        estimatedValue: true
      }
    }),
    prisma.lead.aggregate({
      where: {
        status: "WON"
      },
      _sum: {
        estimatedValue: true
      }
    }),
    prisma.lead.count({
      where: {
        nextFollowUpDate: {
          lt: now
        },
        status: {
          notIn: ["WON", "LOST"]
        }
      }
    })
  ]);

  return {
    totalLeads,
    pipelineValue: pipelineAgg._sum.estimatedValue?.toString() || "0",
    wonValue: wonAgg._sum.estimatedValue?.toString() || "0",
    overdueFollowUps: overdueFollowUpsCount
  };
}

export async function getLeads(filters?: {
  query?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  source?: LeadSource;
}): Promise<SerializedLead[]> {
  const prisma = getPrisma();
  const where: Prisma.LeadWhereInput = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.priority) {
    where.priority = filters.priority;
  }

  if (filters?.source) {
    where.source = filters.source;
  }

  if (filters?.query) {
    const q = filters.query.trim();
    where.OR = [
      { leadNumber: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } }
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    include: {
      followUps: {
        orderBy: { date: "asc" },
        include: {
          createdBy: {
            select: { fullName: true, email: true }
          }
        }
      },
      assignedTo: {
        select: { fullName: true, email: true }
      }
    },
    orderBy: [
      { nextFollowUpDate: "asc" },
      { createdAt: "desc" }
    ]
  });

  return leads.map(serializeLead);
}

export async function getLeadById(idOrLeadNumber: string): Promise<SerializedLead | null> {
  const prisma = getPrisma();
  const lead = await prisma.lead.findFirst({
    where: {
      OR: [
        { id: idOrLeadNumber },
        { leadNumber: idOrLeadNumber }
      ]
    },
    include: {
      followUps: {
        orderBy: { date: "asc" },
        include: {
          createdBy: {
            select: { fullName: true, email: true }
          }
        }
      },
      assignedTo: {
        select: { fullName: true, email: true }
      }
    }
  });

  return lead ? serializeLead(lead) : null;
}
