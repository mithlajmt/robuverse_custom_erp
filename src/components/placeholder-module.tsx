import { Card, CardContent } from "@/components/ui/card";

export function PlaceholderModule({ title }: { title: string }) {
  return (
    <Card>
      <CardContent className="py-12">
        <p className="text-base font-semibold text-cyan-50">{title}</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          This route is present in the ERP navigation so the product structure is stable, while implementation stays focused on Phase 1.
        </p>
      </CardContent>
    </Card>
  );
}
