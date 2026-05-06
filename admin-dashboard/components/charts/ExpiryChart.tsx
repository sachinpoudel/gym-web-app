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
import type { ChartPoint } from "@/types";

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #0a0a0a",
  fontSize: "12px",
};

type Props = {
  data: ChartPoint[];
};

export default function ExpiryChart({ data }: Props) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="#0a0a0a" />
          <YAxis stroke="#0a0a0a" />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" fill="#0a0a0a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
