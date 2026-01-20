"use client";

import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { Activity, Brain, Dumbbell, Target } from "lucide-react";

// Colors & Icons Configuration
const CONFIG = {
  technical: { icon: Activity, color: "#3B82F6" }, // Blue
  tactical: { icon: Target, color: "#8B5CF6" },   // Purple
  physical: { icon: Dumbbell, color: "#F97316" }, // Orange
  mental: { icon: Brain, color: "#006D77" },      // Teal
};

// --- COMPONENT 1: RADAR CHART (Spider Web) ---
export const EvaluationRadarChart = ({
  type,
  score,
  data,
}: {
  type: "technical" | "tactical" | "physical" | "mental";
  score: number;
  data: any[];
}) => {
  const { icon: Icon, color } = CONFIG[type];

  return (
    <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 h-[320px]">
      <div className="flex justify-between items-center mb-2" style={{ color }}>
        <h2 className="font-bold text-sm flex items-center gap-2 capitalize">
          <Icon size={16} /> {type}
        </h2>
        <span className="text-xl font-bold">{score}</span>
      </div>
      
      <div className="w-full h-[90%]">
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 10, fill: "#6b7280", fontWeight: 600 }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                <Radar
                    name={type}
                    dataKey="A"
                    stroke={color}
                    fill={color}
                    fillOpacity={0.4}
                />
                <Tooltip 
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} 
                    itemStyle={{ color: color, fontWeight: "bold", textTransform: "capitalize" }} 
                />
                </RadarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-400 italic">
                No data available for {type}
            </div>
        )}
      </div>
    </div>
  );
};

// --- COMPONENT 2: SUMMARY BAR CHART ---
export const EvaluationSummaryChart = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 h-[250px]">
      <h2 className="text-sm font-bold text-gray-700 mb-4">Category Breakdown</h2>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 500 }}
            tickLine={false}
          />
          <YAxis hide domain={[0, 10]} />
          <Tooltip 
            cursor={{ fill: "#f9fafb" }} 
            contentStyle={{ borderRadius: "8px", border: "none" }} 
          />
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};