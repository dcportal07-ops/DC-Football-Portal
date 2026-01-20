// "use client";

// import React, { useState, useRef } from "react";
// import Image from "next/image";
// import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell } from "recharts";
// import { Download, Loader2, RotateCw, PlayCircle } from "lucide-react";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

// export interface FlipCardData {
//   overallScore: number;
//   stats: { name: string; value: number; fill: string }[];
//   homework: { title: string; desc: string }[];
//   coachName?: string;
// }

// // Helper for video links
// const getVideoLink = (title: string) => {
//   return `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " football drill")}`;
// };

// const PlayerFlipCard = ({ 
//   data, 
//   playerImg, 
//   playerName, 
//   playerId 
// }: { 
//   data: FlipCardData | null, 
//   playerImg: string, 
//   playerName: string, 
//   playerId: string 
// }) => {
//   const [isFlipped, setIsFlipped] = useState(false);
//   const cardRef = useRef<HTMLDivElement>(null); 
//   const [downloading, setDownloading] = useState(false);

//   // --- 🔥 FIXED DOWNLOAD FUNCTION ---
//   const handleDownload = async (format: 'png' | 'pdf') => {
//     if (!cardRef.current) return;
//     setDownloading(true);
    
//     // 1. Save original styles
//     const originalTransform = cardRef.current.style.transform;
//     const originalTransition = cardRef.current.style.transition;

//     // 2. Select the faces (we added classNames 'front-face' and 'back-face' below)
//     const frontFace = cardRef.current.querySelector('.front-face') as HTMLElement;
//     const backFace = cardRef.current.querySelector('.back-face') as HTMLElement;
//     const originalBackTransform = backFace ? backFace.style.transform : '';

//     // 3. Flatten the card for the camera
//     // We remove the 3D spin so the screenshot engine sees a flat, readable div
//     cardRef.current.style.transition = "none";
//     cardRef.current.style.transform = "none";

//     if (isFlipped) {
//         // If we are viewing the BACK, hide the front and make the back upright
//         if(frontFace) frontFace.style.display = 'none';
//         if(backFace) {
//             backFace.style.display = 'flex';
//             backFace.style.transform = "none"; // Remove the rotateY(180deg) from the back face itself
//         }
//     } else {
//         // If we are viewing the FRONT, hide the back
//         if(backFace) backFace.style.display = 'none';
//         if(frontFace) frontFace.style.display = 'flex';
//     }

//     try {
//         // 4. Take the picture
//         const canvas = await html2canvas(cardRef.current, { 
//             useCORS: true, 
//             scale: 2, 
//             backgroundColor: null 
//         });
//         const imgData = canvas.toDataURL("image/png");

//         if (format === 'png') {
//             const link = document.createElement("a");
//             link.href = imgData;
//             link.download = `${playerName}_${isFlipped ? 'Homework' : 'Stats'}.png`;
//             link.click();
//         } else {
//             const pdf = new jsPDF("p", "mm", "a4");
//             const width = pdf.internal.pageSize.getWidth();
//             const height = (canvas.height * width) / canvas.width;
//             pdf.addImage(imgData, "PNG", 0, 0, width, height);
//             pdf.save(`${playerName}_Card.pdf`);
//         }
//     } catch (err) {
//         console.error("Download failed", err);
//     } finally {
//         // 5. Restore original 3D state immediately
//         if(frontFace) frontFace.style.display = '';
//         if(backFace) {
//             backFace.style.display = '';
//             backFace.style.transform = originalBackTransform;
//         }
//         cardRef.current.style.transform = originalTransform;
//         cardRef.current.style.transition = originalTransition;
//         setDownloading(false);
//     }
//   };

//   if (!data) return <div className="w-full h-[500px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">No Card Yet</div>;

//   const stats = data.stats || [];
//   const homework = data.homework || [];

//   return (
//     <div className="flex flex-col gap-4">
        
//         {/* === FLIP CARD CONTAINER === */}
//         <div className="w-full h-[500px] [perspective:1000px] group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
//             <div 
//                 ref={cardRef} 
//                 className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
//             >
                
//                 {/* --- FRONT SIDE (STATS) --- */}
//                 {/* Added 'front-face' class for the downloader to find it */}
//                 <div className="front-face absolute w-full h-full [backface-visibility:hidden] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
//                     <div className="h-24 bg-gradient-to-r from-[#006D77] to-[#83C5BE] relative">
//                         <div className="absolute -bottom-10 left-6">
//                             <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white">
//                                 <Image src={playerImg || "/noAvatar.png"} alt="Student" width={80} height={80} className="object-cover w-full h-full"/>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="mt-12 px-6 flex-1 flex flex-col">
//                         <div className="flex justify-between items-start">
//                             <div>
//                                 <h2 className="text-xl font-bold text-gray-800">{playerName}</h2>
//                                 <p className="text-xs text-gray-500">ID: {playerId}</p>
//                             </div>
//                             <div className="text-right">
//                                 <span className="text-4xl font-bold text-[#006D77]">{data.overallScore}</span>
//                                 <p className="text-[10px] text-gray-400 font-bold uppercase">OVR</p>
//                             </div>
//                         </div>
//                         <div className="flex-1 mt-4">
//                             <ResponsiveContainer width="100%" height="90%">
//                                 <BarChart data={stats} layout="vertical" margin={{ left: 0, right: 20 }}>
//                                     <XAxis type="number" hide domain={[0, 100]} />
//                                     <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
//                                     <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
//                                         {stats.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
//                                     </Bar>
//                                 </BarChart>
//                             </ResponsiveContainer>
//                         </div>
//                     </div>
//                     <div className="p-3 border-t bg-gray-50 text-right text-xs text-blue-500 font-bold flex justify-end items-center gap-1">
//                         Tap for Homework <RotateCw size={12}/>
//                     </div>
//                 </div>

//                 {/* --- BACK SIDE (HOMEWORK) --- */}
//                 {/* Added 'back-face' class for the downloader to find it */}
//                 <div className="back-face absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-slate-900 text-white rounded-xl shadow-lg overflow-hidden flex flex-col border border-slate-700">
//                     <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
//                         <h3 className="text-lg font-bold text-[#22D3EE] mb-4 border-b border-slate-700 pb-2">🎯 Homework Tasks</h3>
//                         <div className="space-y-4">
//                             {homework.length > 0 ? homework.map((hw, i) => (
//                             <div key={i} className="bg-slate-800 p-3 rounded border border-slate-700 hover:border-[#22D3EE] transition">
//                                 <div className="flex justify-between items-start">
//                                     <div>
//                                         <p className="text-sm font-bold text-[#22D3EE] uppercase">{hw.title}</p>
//                                         <p className="text-xs text-gray-300 mt-1">{hw.desc}</p>
//                                     </div>
//                                 </div>
//                                 <a 
//                                     href={getVideoLink(hw.title)} 
//                                     target="_blank" 
//                                     rel="noopener noreferrer"
//                                     onClick={(e) => e.stopPropagation()} 
//                                     className="mt-3 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition"
//                                 >
//                                     <PlayCircle size={12} /> Watch Tutorial
//                                 </a>
//                             </div>
//                             )) : (
//                                 <p className="text-gray-500 text-sm italic text-center mt-10">No homework assigned yet.</p>
//                             )}
//                         </div>
//                     </div>
//                     <div className="p-3 bg-black/20 text-xs text-gray-400 flex items-center gap-1">
//                         <RotateCw size={12}/> Click to flip back
//                     </div>
//                 </div>
//             </div>
//         </div>

//         {/* === DOWNLOAD BUTTONS === */}
//         <div className="grid grid-cols-2 gap-3 mt-2">
//             <button 
//                 onClick={() => handleDownload('png')} 
//                 disabled={downloading}
//                 className="flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
//             >
//                 {downloading ? <Loader2 size={14} className="animate-spin"/> : <Download size={14} />}
//                 Download Image
//             </button>
//             <button 
//                 onClick={() => handleDownload('pdf')} 
//                 disabled={downloading}
//                 className="flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
//             >
//                 {downloading ? <Loader2 size={14} className="animate-spin"/> : <Download size={14} />}
//                 Download PDF
//             </button>
//         </div>
//     </div>
//   );
// };

// export default PlayerFlipCard;
"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import { 
  ResponsiveContainer, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Tooltip
} from "recharts";
import { Download, Loader2, RotateCw, Trophy, Calendar, PlayCircle, AlertCircle } from "lucide-react"; 
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// 🔥 1. DEFINE AND EXPORT THE INTERFACE HERE
export interface FlipCardData {
  overallScore: string;
  stats: {
    technical: any[]; // or define specific shape { name: string, current: number }[]
    tactical: any[];
    physical: any[];
    mental: any[];
    attacking: { current: number };
    defending: { current: number };
  };
  drills?: {
    primary: string;
    primaryDetails: string;
    secondary?: string;
    secondaryDetails?: string;
  };
}

// --- CONFIGURATION ---
const CATEGORIES = {
  technical: ["Ball Control","Dribbling","Passing","Shooting","First Touch","Weak Foot"],
  tactical:  ["Positioning","Decision","Vision","Support","Transition","Adaptability"],
  physical:  ["Speed","Agility","Balance","Strength","Endurance","Coord"],
  mental:    ["Focus","Confidence","Comms","Teamwork","Resilience","Motiv"],
};

// ... (getVideoLink and MiniRadar components stay the same) ...

const getVideoLink = (drillName: string) => {
  if (!drillName || drillName === "General Training") return "#";
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(drillName + " soccer drill")}`;
};

const MiniRadar = ({ title, data, size = "small" }: { title: string, data: any[], size?: "small" | "large" }) => {
  const isLarge = size === "large";
  const fontSize = isLarge ? 10 : 7;
  
  return (
    <div className="flex flex-col items-center relative h-full w-full">
      <span className={`font-bold text-gray-700 uppercase tracking-tight mb-1 ${isLarge ? "text-sm" : "text-[9px]"}`}>
        {title}
      </span>
      <div className="flex-1 w-full -mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius={isLarge ? "70%" : "65%"} data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: fontSize, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
            <Radar name="Goal" dataKey="goal" stroke="#f97316" strokeWidth={2} fill="#f97316" fillOpacity={0.1} isAnimationActive={false} />
            <Radar name="Current" dataKey="current" stroke="#2563eb" strokeWidth={2} fill="#2563eb" fillOpacity={0.4} isAnimationActive={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 🔥 2. UPDATE PROPS TO USE THE INTERFACE
const PlayerFlipCard = ({ 
  data, 
  playerImg, 
  playerName, 
  playerTeam, 
  playerId 
}: { 
  data: FlipCardData | null, // Changed from 'any' to 'FlipCardData'
  playerImg: string, 
  playerName: string, 
  playerTeam?: string, 
  playerId: string 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null); 
  const [downloading, setDownloading] = useState(false);

  // --- DATA PROCESSING ---
  const processedData = useMemo(() => {
    if (!data) return null;

    const mapToDetailed = (categoryKey: keyof typeof CATEGORIES, inputVal: any) => {
       if (Array.isArray(inputVal)) return inputVal;
       const baseScore = typeof inputVal === 'number' ? inputVal : 5;
       return CATEGORIES[categoryKey].map(skillName => ({
         name: skillName,
         current: baseScore,
         goal: Math.min(baseScore + 2, 10)
       }));
    };

    const techAvg = data.stats?.technical ? (data.stats.technical.reduce((a:any,b:any)=>a+b.current,0)/6) : 5;
    const tactAvg = data.stats?.tactical ? (data.stats.tactical.reduce((a:any,b:any)=>a+b.current,0)/6) : 5;
    const physAvg = data.stats?.physical ? (data.stats.physical.reduce((a:any,b:any)=>a+b.current,0)/6) : 5;
    const mentAvg = data.stats?.mental ? (data.stats.mental.reduce((a:any,b:any)=>a+b.current,0)/6) : 5;
    const attScore = Number(data.stats?.attacking?.current) || 5;
    const defScore = Number(data.stats?.defending?.current) || 5;

    const overallData = [
        { name: "Technical", current: techAvg, goal: techAvg+1 },
        { name: "Tactical", current: tactAvg, goal: tactAvg+1 },
        { name: "Physical", current: physAvg, goal: physAvg+1 },
        { name: "Mental", current: mentAvg, goal: mentAvg+1 },
        { name: "Attacking", current: attScore, goal: attScore+1 },
        { name: "Defending", current: defScore, goal: defScore+1 },
    ];

    return {
      overallScore: data.overallScore || "0.0",
      overallData,
      stats: {
        technical: mapToDetailed('technical', data.stats?.technical),
        tactical: mapToDetailed('tactical', data.stats?.tactical),
        physical: mapToDetailed('physical', data.stats?.physical),
        mental: mapToDetailed('mental', data.stats?.mental),
      },
      drills: {
        primary: data.drills?.primary || "General Training",
        primaryDetails: data.drills?.primaryDetails || "See coach for details",
        secondary: data.drills?.secondary,
        secondaryDetails: data.drills?.secondaryDetails
      }
    };
  }, [data]);

  // ... (Rest of the component logic remains exactly the same) ...
  // handleDownload function...
  // if (!data || !processedData) return ...
  // return JSX ...

  // Keep the rest of your code here (handleDownload, return statement, etc.)
  // I am hiding it to save space, but DO NOT DELETE IT.

  const handleDownload = async (format: 'png' | 'pdf') => {
    if (!cardRef.current) return;
    setDownloading(true);
    const originalTransform = cardRef.current.style.transform;
    cardRef.current.style.transform = "none"; 
    
    const targetFace = isFlipped 
      ? cardRef.current.querySelector('.back-face') as HTMLElement 
      : cardRef.current.querySelector('.front-face') as HTMLElement;

    if (targetFace) {
        try {
            const canvas = await html2canvas(targetFace, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
            const imgData = canvas.toDataURL("image/png");
            if (format === 'png') {
                const link = document.createElement("a");
                link.href = imgData;
                link.download = `${playerName}_Report.png`;
                link.click();
            } else {
                const pdf = new jsPDF("p", "mm", "a4");
                const width = pdf.internal.pageSize.getWidth();
                const height = (canvas.height * width) / canvas.width;
                pdf.addImage(imgData, "PNG", 0, 0, width, height);
                pdf.save(`${playerName}_Report.pdf`);
            }
        } catch (err) { console.error(err); } 
        finally { 
            cardRef.current.style.transform = originalTransform; 
            setDownloading(false); 
        }
    }
  };

  if (!data || !processedData) {
    return (
      <div className="w-full h-[600px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center">
         <AlertCircle className="text-gray-400 mb-2" size={32} />
         <p className="text-gray-500 font-medium">No Data Available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
        
        <div className="w-full h-[650px] [perspective:1000px] group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <div ref={cardRef} className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}>
                
                {/* --- FRONT SIDE --- */}
                <div className="front-face absolute w-full h-full [backface-visibility:hidden] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-gray-900 text-white px-5 py-3 flex justify-between items-center">
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold uppercase tracking-wide">{playerName}</h2>
                            <span className="text-[10px] text-gray-400 font-medium tracking-widest">{playerTeam || "ACADEMY"} • 2025 SEASON</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-bold text-blue-400 leading-none">{processedData.overallScore}</span>
                            <span className="text-[9px] uppercase text-gray-400">OVR Evaluation</span>
                        </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col gap-2">
                        <div className="flex h-[200px] gap-4 mb-2">
                            <div className="w-1/3 relative rounded-lg overflow-hidden border-2 border-gray-100 shadow-sm bg-gray-50">
                                <Image src={playerImg || "/noAvatar.png"} alt="Player" fill className="object-cover" />
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg border border-gray-100 p-2">
                                <MiniRadar title="Overall Evaluation" data={processedData.overallData} size="large" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 flex-1">
                            <div className="bg-blue-50/30 rounded-lg border border-blue-100 p-1"><MiniRadar title="TECHNICAL" data={processedData.stats.technical} /></div>
                            <div className="bg-orange-50/30 rounded-lg border border-orange-100 p-1"><MiniRadar title="TACTICAL" data={processedData.stats.tactical} /></div>
                            <div className="bg-green-50/30 rounded-lg border border-green-100 p-1"><MiniRadar title="PHYSICAL" data={processedData.stats.physical} /></div>
                            <div className="bg-purple-50/30 rounded-lg border border-purple-100 p-1"><MiniRadar title="MENTAL" data={processedData.stats.mental} /></div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-500">
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Current</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Goal</span>
                        </div>
                        <div className="flex items-center gap-1 font-bold text-gray-700">
                            Flip for Plan <RotateCw size={10}/>
                        </div>
                    </div>
                </div>

                {/* --- BACK SIDE --- */}
                <div className="back-face absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white rounded-xl shadow-xl border border-gray-200 p-6 flex flex-col">
                    
                    <div className="border-b-2 border-gray-800 pb-3 mb-5 flex justify-between items-end">
                        <h3 className="text-2xl font-bold text-gray-800 uppercase">Home Assignments</h3>
                        <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded">4-6 WEEKS PLAN</span>
                    </div>

                    <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar text-sm text-gray-700">
                        
                        {/* 1. TECHNICAL FOCUS WITH VIDEO BUTTON */}
                        <div>
                            <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                                <Trophy size={16} className="text-blue-600"/> 
                                Technical Focus
                            </h4>
                            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
                                <li className="flex items-start flex-wrap gap-2">
                                    <span className="font-semibold text-gray-900">Primary Drill:</span> 
                                    <span>{processedData.drills.primary}</span>
                                    
                                    {/* 🔥 NEW VIDEO BUTTON */}
                                    <a 
                                      href={getVideoLink(processedData.drills.primary)} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-100 hover:bg-red-100 transition no-underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                        <PlayCircle size={10} /> Watch
                                    </a>
                                </li>
                                <li className="text-gray-600 italic">
                                    "{processedData.drills.primaryDetails}"
                                </li>
                            </ul>
                        </div>

                        {/* 2. SECONDARY FOCUS */}
                        {processedData.drills.secondary && (
                            <div>
                                <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                                    <Calendar size={16} className="text-orange-500"/> 
                                    Secondary / Physical
                                </h4>
                                <ul className="list-disc pl-5 space-y-2 leading-relaxed">
                                    <li className="flex items-start flex-wrap gap-2">
                                        <span className="font-semibold text-gray-900">Drill:</span> 
                                        <span>{processedData.drills.secondary}</span>

                                        {/* 🔥 SECONDARY VIDEO BUTTON */}
                                        <a 
                                          href={getVideoLink(processedData.drills.secondary)} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-100 hover:bg-red-100 transition no-underline"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                             <PlayCircle size={10} /> Watch
                                        </a>
                                    </li>
                                    <li className="text-gray-600 italic">
                                        "{processedData.drills.secondaryDetails}"
                                    </li>
                                </ul>
                            </div>
                        )}

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-wide">Quick Monitoring</h4>
                            <ul className="space-y-1 text-xs text-gray-600">
                                <li>• 12/12 technical sessions completed</li>
                                <li>• Sleep avg {'>'} 9h required</li>
                                <li>• Hydration check OK</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-center text-gray-400 cursor-pointer hover:text-gray-600" onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}>
                        <div className="flex items-center gap-2 text-xs font-bold">
                            <RotateCw size={14}/> Back to Evaluation
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
            <button onClick={() => handleDownload('png')} disabled={downloading} className="flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition">
                {downloading ? <Loader2 size={14} className="animate-spin"/> : <Download size={14} />} Export PNG
            </button>
            <button onClick={() => handleDownload('pdf')} disabled={downloading} className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-800 border border-gray-300 text-xs font-bold rounded-lg hover:bg-gray-200 transition">
                {downloading ? <Loader2 size={14} className="animate-spin"/> : <Download size={14} />} Export PDF
            </button>
        </div>
    </div>
  );
};

export default PlayerFlipCard;