"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useId } from "react";
import type { ChartPoint } from "@/types";

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid rgba(0, 0, 0, 0.1)",
  fontSize: "12px",
};

type Props = {
  data: ChartPoint[];
};

export default function ExpiryChart({ data }: Props) {
  const gradientId = useId();
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
          <XAxis dataKey="label" stroke="#111827" tickLine={false} axisLine={false} />
          <YAxis stroke="#111827" tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" fill={`url(#${gradientId})`} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
