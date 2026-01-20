"use client";

import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from "recharts";

const TEAL = "#006D77";

export const DrillRadarChart = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[300px] flex flex-col">
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Drill Profile</h2>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Intensity" dataKey="A" stroke={TEAL} fill={TEAL} fillOpacity={0.5} />
            <Tooltip contentStyle={{ borderRadius: '8px' }} itemStyle={{ color: TEAL }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};