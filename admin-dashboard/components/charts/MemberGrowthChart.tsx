"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
} from "recharts";
import { useId } from "react";
import type { ChartPoint } from "@/types";

type Props = {
  data: ChartPoint[];
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  valueFormat?: "number" | "currency" | "compact";
};

export default function MemberGrowthChart({
  data,
  color = "#1d4ed8",
  gradientFrom = "rgba(29, 78, 216, 0.35)",
  gradientTo = "rgba(29, 78, 216, 0)",
  valueFormat = "number",
}: Props) {
  const gradientId = useId();
  const tooltipStyle = {
    backgroundColor: "#ffffff",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    fontSize: "12px",
  };
  const formatter = (value: number) =>
    valueFormat === "currency"
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(value || 0)
      : valueFormat === "compact"
        ? new Intl.NumberFormat("en-US", {
            notation: "compact",
            compactDisplay: "short",
            maximumFractionDigits: 1,
          }).format(value || 0)
        : value.toString();

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
          <XAxis dataKey="label" stroke="#111827" tickLine={false} axisLine={false} />
          <YAxis
            stroke="#111827"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatter(Number(value))}
          />
          <Tooltip contentStyle={tooltipStyle} formatter={formatter} />
          <Area type="monotone" dataKey="value" stroke="none" fill={`url(#${gradientId})`} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
