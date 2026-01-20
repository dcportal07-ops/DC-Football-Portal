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
            <Tooltip 
                cursor={{ fill: "transparent" }} 
                contentStyle={{ borderRadius: '10px', borderColor: 'lightgray' }} 
            />
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

// export const PlayerRadarChart = ({ data }: { data: any[] }) => {
//   return (
//     <div className="bg-white rounded-md p-4 h-[350px] shadow-sm border border-gray-100">
//       <div className="flex justify-between items-center mb-2">
//          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Skill Breakdown</h3>
//          <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-1 rounded border border-teal-100">Live Stats</span>
//       </div>
      
//       <div className="w-full h-[90%]">
//         <ResponsiveContainer width="100%" height="100%">
//           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
//             <PolarGrid stroke="#e5e7eb" />
//             <PolarAngleAxis 
//                 dataKey="subject" 
//                 tick={{ fill: '#4b5563', fontSize: 11, fontWeight: "bold" }} 
//             />
//             <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            
//             {/* The Shape */}
//             <Radar 
//                 name="Player Stats" 
//                 dataKey="A" 
//                 stroke={TEAL} 
//                 strokeWidth={2}
//                 fill={TEAL} 
//                 fillOpacity={0.4} 
//             />
            
//             <Tooltip 
//                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
//                 itemStyle={{ color: TEAL, fontWeight: 'bold' }}
//             />
//           </RadarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

export const PlayerRadarChart = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-white rounded-md p-4 h-[350px] shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-2">
         <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Skill Breakdown</h3>
         <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-1 rounded border border-teal-100">Live Stats</span>
      </div>
      
      <div className="w-full h-[90%]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#4b5563', fontSize: 11, fontWeight: "bold" }} 
            />
            {/* ✅ FIXED: Domain changed to 0-10 */}
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
            
            <Radar 
                name="Player Stats" 
                dataKey="A" 
                stroke={TEAL} 
                strokeWidth={2}
                fill={TEAL} 
                fillOpacity={0.4} 
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