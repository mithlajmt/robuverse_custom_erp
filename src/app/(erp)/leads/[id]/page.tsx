import { notFound } from "next/navigation";
import { getLeadById, getLeads } from "@/lib/repositories/leads";
import { LeadDetailWorkspace } from "@/components/leads/lead-detail-workspace";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  return <LeadDetailWorkspace initialLead={lead} />;
}
