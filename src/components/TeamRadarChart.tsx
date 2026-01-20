"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
} from "recharts";

const TEAL = "#006D77";
const ORANGE = "#F97316";

// --- COMPONENT 1: TEAM DNA (Radar) ---
export const TeamRadarChart = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[350px] flex flex-col">
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Team DNA</h2>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Team Stats" dataKey="A" stroke={TEAL} fill={TEAL} fillOpacity={0.5} />
            <Tooltip contentStyle={{ borderRadius: '8px' }} itemStyle={{ color: TEAL }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- COMPONENT 2: MATCH HISTORY (Bar) ---
// Note: Since we don't have match results in DB yet, we keep this static or mock for now
export const TeamPerformanceChart = () => {
  const matchHistory = [
    { name: "Match 1", gf: 3, ga: 1 },
    { name: "Match 2", gf: 2, ga: 2 },
    { name: "Match 3", gf: 4, ga: 0 },
    { name: "Match 4", gf: 1, ga: 2 },
    { name: "Match 5", gf: 3, ga: 0 },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[350px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-700">Goals For vs. Against</h2>
        <span className="text-xs text-gray-400">Last 5 Matches (Simulated)</span>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={matchHistory} barGap={0}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="name" axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} />
          <YAxis axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} />
          <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: '8px' }} />
          <Bar dataKey="gf" name="Goals For" fill={TEAL} radius={[4, 4, 0, 0]} barSize={20} />
          <Bar dataKey="ga" name="Goals Against" fill={ORANGE} radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};