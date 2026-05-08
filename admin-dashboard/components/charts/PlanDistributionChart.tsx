"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { PlanDistributionPoint } from "@/types";

const COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ef4444"];

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid rgba(0, 0, 0, 0.1)",
  fontSize: "12px",
};

type Props = {
  data: PlanDistributionPoint[];
};

export default function PlanDistributionChart({ data }: Props) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
            stroke="#ffffff"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend iconType="square" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
