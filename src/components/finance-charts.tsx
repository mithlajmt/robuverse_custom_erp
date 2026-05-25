"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const colors = ["#22d3ee", "#34d399", "#f59e0b", "#fb7185", "#a78bfa", "#60a5fa"];

export function FinanceCharts({
  monthlyTrend,
  categorySpend
}: {
  monthlyTrend: Array<{ month: string; income: number; expense: number }>;
  categorySpend: Array<{ name: string; amount: number }>;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Cash Inflow vs Outflow</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend}>
              <CartesianGrid stroke="rgba(125, 211, 252, 0.12)" vertical={false} />
              <XAxis dataKey="month" stroke="#8aa0af" fontSize={12} />
              <YAxis stroke="#8aa0af" fontSize={12} tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
              <Tooltip
                contentStyle={{ background: "#07111a", border: "1px solid rgba(125, 211, 252, 0.2)", borderRadius: 8 }}
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Bar dataKey="income" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill="#fb7185" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categorySpend} dataKey="amount" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                {categorySpend.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#07111a", border: "1px solid rgba(125, 211, 252, 0.2)", borderRadius: 8 }}
                formatter={(value) => formatCurrency(Number(value))}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
