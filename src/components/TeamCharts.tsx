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
  Legend
} from "recharts";

const TEAL = "#006D77";
const ORANGE = "#F97316";

// --- COMPONENT 1: TEAM DNA (Radar Chart) ---
export const TeamRadarChart = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[350px] flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Team DNA</h2>
      </div>
      
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 600 }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false}/>
            <Radar 
              name="Team Stats" 
              dataKey="A" 
              stroke={TEAL} 
              fill={TEAL} 
              fillOpacity={0.5} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              itemStyle={{ color: TEAL, fontWeight: 'bold' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- COMPONENT 2: MATCH PERFORMANCE (Bar Chart) ---
export const TeamPerformanceChart = () => {
  // Mock Data for now (Since we don't have Match Results in DB yet)
  const matchHistory = [
    { name: "Match 1", gf: 3, ga: 1 },
    { name: "Match 2", gf: 2, ga: 2 },
    { name: "Match 3", gf: 4, ga: 0 },
    { name: "Match 4", gf: 1, ga: 2 },
    { name: "Match 5", gf: 3, ga: 0 },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[350px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-700">Goals For vs. Against</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Last 5 Matches</span>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={matchHistory} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tick={{ fill: "#9ca3af", fontSize: 11 }} 
            tickLine={false} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tick={{ fill: "#9ca3af", fontSize: 11 }} 
            tickLine={false} 
          />
          <Tooltip 
            cursor={{ fill: "#f9fafb" }} 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}/>
          
          <Bar 
            dataKey="gf" 
            name="Goals For" 
            fill={TEAL} 
            radius={[4, 4, 0, 0]} 
            barSize={30} 
          />
          <Bar 
            dataKey="ga" 
            name="Goals Against" 
            fill={ORANGE} 
            radius={[4, 4, 0, 0]} 
            barSize={30} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};