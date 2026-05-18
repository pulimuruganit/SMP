"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export function EmailEmotionDonut({
  total,
  breakdown,
}: {
  total: number;
  breakdown: { positive: number; neutral: number; negative: number };
}) {
  const data = [
    { name: "Positive", value: breakdown.positive, color: "var(--success)" },
    { name: "Neutral", value: breakdown.neutral, color: "var(--warning)" },
    { name: "Negative", value: breakdown.negative, color: "var(--danger)" },
  ];

  return (
    <div className="relative h-36 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={42}
            outerRadius={62}
            stroke="transparent"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              boxShadow: "0 10px 30px rgba(2,6,23,0.15)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-2xl font-extrabold tracking-tight">{total}</div>
          <div className="text-xs text-[var(--muted-foreground)]">Total</div>
        </div>
      </div>
    </div>
  );
}
