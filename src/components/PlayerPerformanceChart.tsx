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

// --- COMPONENT 1: PERFORMANCE CHART (Bar Chart) ---
export const PlayerPerformanceChart = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-white rounded-md p-4 h-[300px] shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Season Progression</h2>
      <div className="w-full h-[85%]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} />
            <YAxis axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} domain={[0, 10]} />
            <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: '10px', borderColor: 'lightgray' }} />
            <Bar dataKey="score" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? TEAL : ORANGE} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- COMPONENT 2: RADAR CHART (Detailed Ability) ---
export const PlayerRadarChart = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-white rounded-md p-4 h-[300px] shadow-sm border border-gray-100">
      <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase text-center tracking-widest">Skill Breakdown</h3>
      <div className="w-full h-[90%]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 10, fontWeight: "bold" }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Skills" dataKey="A" stroke={TEAL} fill={TEAL} fillOpacity={0.5} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};