import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function StatCard({
  label,
  value,
  helper,
  tone = "cyan"
}: {
  label: string;
  value: number;
  helper?: string;
  tone?: "cyan" | "green" | "rose" | "amber";
}) {
  const toneClass = {
    cyan: "text-cyan-200",
    green: "text-emerald-200",
    rose: "text-rose-200",
    amber: "text-amber-200"
  }[tone];

  return (
    <Card>
      <CardContent>
        <p className="text-sm text-slate-400">{label}</p>
        <p className={`mt-3 text-2xl font-semibold ${toneClass}`}>{formatCurrency(value)}</p>
        {helper && <p className="mt-2 text-xs text-slate-500">{helper}</p>}
      </CardContent>
    </Card>
  );
}
