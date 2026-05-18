"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CashFlowPoint } from "@/lib/types";

function formatDay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function CashFlowChart({ points }: { points: CashFlowPoint[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="rgba(148,163,184,0.20)" strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tickFormatter={formatDay}
            tick={{ fontSize: 12, fill: "rgba(148,163,184,0.9)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "rgba(148,163,184,0.9)" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              boxShadow: "0 10px 30px rgba(2,6,23,0.15)",
            }}
            labelFormatter={(label) => formatDay(String(label))}
          />
          <Line
            type="monotone"
            dataKey="incoming"
            stroke="var(--success)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="outgoing"
            stroke="var(--danger)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

