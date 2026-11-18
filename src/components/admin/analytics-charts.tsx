"use client";

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCompactIDR } from "@/lib/utils";

const COLORS = ["#704A37", "#A97850", "#D9B895", "#F2C8C7", "#8FAB72"];

const tooltipStyle = { borderRadius: 14, border: "1px solid #D9B895", fontSize: 12, boxShadow: "0 12px 30px rgba(112,74,55,.15)" };

export function RevenueChart({ data, type = "bar" }: { data: Array<{ label: string; revenue: number; orders: number }>; type?: "bar" | "line" }) {
  const Chart = type === "bar" ? BarChart : LineChart;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <Chart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#D9B895" opacity={0.45} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8B6247" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => formatCompactIDR(Number(v))} tick={{ fontSize: 11, fill: "#8B6247" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCompactIDR(Number(value)), "Revenue"]} />
        {type === "bar" ? <Bar dataKey="revenue" fill="#A97850" radius={[8, 8, 0, 0]} maxBarSize={34} /> : <Line type="monotone" dataKey="revenue" stroke="#704A37" strokeWidth={3} dot={{ r: 3, fill: "#F2C8C7" }} activeDot={{ r: 5 }} />}
      </Chart>
    </ResponsiveContainer>
  );
}

export function PaymentMixChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCompactIDR(Number(v)), "Revenue"]} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
