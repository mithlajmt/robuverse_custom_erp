import "dotenv/config";
import { PrismaClient, LeadStatus, LeadPriority, LeadSource, FollowUpType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding sample leads into Lead CRM...");

  const admin = await prisma.profile.findFirst({ where: { role: "admin" } });

  const sampleLeads = [
    {
      leadNumber: "LEAD-2026-0001",
      name: "Anand Verma",
      company: "Apex Automation LLP",
      email: "anand@apexauto.in",
      phone: "+91 9812345678",
      source: "WEBSITE" as LeadSource,
      status: "NEW_ENQUIRY" as LeadStatus,
      priority: "HOT" as LeadPriority,
      estimatedValue: 125000,
      notes: "Inquired about 3D printing bulk components & robotics workshop package.",
      nextFollowUpDate: new Date(Date.now() + 86400000) // tomorrow
    },
    {
      leadNumber: "LEAD-2026-0002",
      name: "Priya Nair",
      company: "Kochi Science Institute",
      email: "priya@ksinstitute.org",
      phone: "+91 9745123890",
      source: "WHATSAPP" as LeadSource,
      status: "QUOTATION_SENT" as LeadStatus,
      priority: "WARM" as LeadPriority,
      estimatedValue: 45000,
      notes: "Requested quotation for student STEM kit delivery.",
      nextFollowUpDate: new Date(Date.now() + 172800000) // 2 days
    },
    {
      leadNumber: "LEAD-2026-0003",
      name: "Vikram Menon",
      company: "Menon Engineering Works",
      email: "vikram@menoneng.com",
      phone: "+91 9988776655",
      source: "REFERRAL" as LeadSource,
      status: "WON" as LeadStatus,
      priority: "HOT" as LeadPriority,
      estimatedValue: 210000,
      notes: "Annual maintenance & hardware prototype development deal closed.",
      nextFollowUpDate: null
    }
  ];

  for (const leadData of sampleLeads) {
    const lead = await prisma.lead.upsert({
      where: { leadNumber: leadData.leadNumber },
      update: leadData,
      create: {
        ...leadData,
        createdById: admin?.id || null
      }
    });

    // Create initial follow-up
    await prisma.leadFollowUp.create({
      data: {
        leadId: lead.id,
        type: "NOTE" as FollowUpType,
        summary: `Lead created from ${leadData.source}. Requirements logged.`,
        createdById: admin?.id || null
      }
    });

    console.log(`✅ Lead ${lead.leadNumber} (${lead.name}) seeded!`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
