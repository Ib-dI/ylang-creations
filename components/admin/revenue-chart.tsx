"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function RevenueChart({
  data,
}: {
  data: { name: string; revenue: number }[];
}) {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-[300px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a77769" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a77769" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#666", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#666", fontSize: 12 }}
            tickFormatter={(value) => `${value}€`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            }}
            formatter={(value: number | undefined) => [
              `${(value || 0).toFixed(2)}€`,
              "Revenu",
            ]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#a77769"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
