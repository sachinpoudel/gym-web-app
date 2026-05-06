"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { ChartPoint } from "@/types";

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #0a0a0a",
  fontSize: "12px",
};

type Props = {
  data: ChartPoint[];
};

export default function MemberGrowthChart({ data }: Props) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="#0a0a0a" />
          <YAxis stroke="#0a0a0a" />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0a0a0a"
            strokeWidth={2}
            dot={{ r: 3, fill: "#0a0a0a" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
