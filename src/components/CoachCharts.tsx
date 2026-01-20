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
  PieChart,
  Pie,
  Legend,
} from "recharts";
import Image from "next/image";

// --- COLORS ---
const TEAL = "#006D77";
const ORANGE = "#F97316";

// --- COMPONENT 1: Middle Charts (Radar + Bar) ---
// Now accepts data as PROPS
export const CoachMiddleCharts = ({ skillsData, performanceData }: { skillsData: any[], performanceData: any[] }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[350px]">
      {/* SKILLS CHART */}
      <div className="bg-white rounded-md p-4 h-full shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Team Skills Avg</h2>
        </div>
        <div className="w-full h-[90%]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillsData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Skills" dataKey="A" stroke={TEAL} fill={TEAL} fillOpacity={0.5} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PERFORMANCE CHART */}
      <div className="bg-white rounded-md p-4 h-full shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Recent Performance</h2>
        </div>
        <div className="w-full h-[90%]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} />
              <YAxis axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} domain={[0, 100]} />
              <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: '10px', borderColor: 'lightgray' }} />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? TEAL : ORANGE} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT 2: Bottom Chart (Pie) ---
// Now accepts data as PROPS
export const CoachDemographicsChart = ({ data }: { data: { name: string, value: number, fill: string }[] }) => {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 h-[250px]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-700">Demographics</h2>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <div className="w-full h-full relative">
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
            <Tooltip contentStyle={{ borderRadius: '10px', borderColor: 'lightgray' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="text-xs text-gray-400">Total</span>
          <h2 className="text-xl font-bold text-gray-700">
             {data.reduce((acc, curr) => acc + curr.value, 0)}
          </h2>
        </div>
      </div>
    </div>
  );
};