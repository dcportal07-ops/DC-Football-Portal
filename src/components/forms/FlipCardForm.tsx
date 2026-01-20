// "use client";

// import { useState, useEffect } from "react";
// import { createFlipCard } from "@/lib/actions";
// import { MASTER_DRILLS } from "@/lib/drills";

// const FlipCardForm = ({ playerId, coachId }: { playerId: string; coachId: string }) => {
//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
  
//   // State for automatic calculation
//   const [stats, setStats] = useState({
//     tech: "", tact: "", phys: "", ment: "", att: "", def: ""
//   });
//   const [overall, setOverall] = useState("0.0");

//   // Auto-calculate average whenever stats change
//   useEffect(() => {
//     const values = Object.values(stats).map(v => parseFloat(v) || 0);
//     // Only calculate if at least one value is entered to avoid 0.0 initially if desired, 
//     // but 0.0 is fine as a start.
//     const sum = values.reduce((a, b) => a + b, 0);
//     const avg = values.length > 0 ? (sum / 6).toFixed(1) : "0.0";
//     setOverall(avg);
//   }, [stats]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     // Limit value between 0-10
//     if (parseFloat(value) > 10) return; 
//     setStats(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);
//     const formData = new FormData(e.currentTarget);
    
//     const drill1Name = formData.get("hw1_select") as string;
//     const drill2Name = formData.get("hw2_select") as string;

//     const cardData = {
//       overallScore: Number(overall), // Use the calculated state
//       coachName: "Coach", 
//       stats: [
//          { name: "Technical", value: Number(stats.tech), fill: "#22D3EE" },
//          { name: "Tactical", value: Number(stats.tact), fill: "#8B5CF6" },
//          { name: "Physical", value: Number(stats.phys), fill: "#F97316" },
//          { name: "Mental", value: Number(stats.ment), fill: "#006D77" },
//          { name: "Attacking", value: Number(stats.att), fill: "#EF4444" },
//          { name: "Defending", value: Number(stats.def), fill: "#10B981" },
//       ],
//       weaknesses: [], // Simplified for now
//       homework: [
//          { 
//            title: drill1Name || "Custom Drill", 
//            desc: formData.get("hw1_desc") || "Follow coach instructions." 
//          },
//          ...(drill2Name ? [{ 
//            title: drill2Name, 
//            desc: formData.get("hw2_desc") || "Follow coach instructions." 
//          }] : []),
//       ]
//     };

//     try {
//         await createFlipCard(playerId, coachId, cardData as any);
//         alert("Card Issued! Homework & Stats Updated. 🚀");
//         setOpen(false);
//         // Reset form
//         setStats({ tech: "", tact: "", phys: "", ment: "", att: "", def: "" });
//     } catch (error) {
//         console.error("Error:", error);
//         alert("Failed to issue card.");
//     } finally {
//         setLoading(false);
//     }
//   };

//   return (
//     <>
//       <button onClick={() => setOpen(true)} className="w-full py-2 bg-teal-600 text-white rounded-md font-bold hover:bg-teal-700 transition shadow-sm text-sm">
//           + Generate New Card
//       </button>

//       {open && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
//              <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-bold text-gray-800">New Performance Card</h2>
//                 <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
//              </div>
             
//              <form onSubmit={handleSubmit} className="space-y-4">
                
//                 {/* 1. Score (Read Only - Calculated) */}
//                 <div>
//                    <label className="text-xs font-bold text-gray-500 uppercase">Overall Rating (Auto-Calculated)</label>
//                    <div className="w-full border p-2 rounded-md font-bold text-lg bg-gray-100 text-[#006D77]">
//                      {overall}
//                    </div>
//                    <input type="hidden" name="overall" value={overall} />
//                 </div>

//                 {/* 2. Stats Inputs (0-10) */}
//                 <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
//                     <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Player Stats (0-10)</label>
//                     <div className="grid grid-cols-2 gap-3">
//                         <input name="tech" type="number" step="0.1" min="0" max="10" placeholder="Technical" value={stats.tech} onChange={handleChange} className="w-full border p-2 rounded text-sm" required/>
//                         <input name="tact" type="number" step="0.1" min="0" max="10" placeholder="Tactical" value={stats.tact} onChange={handleChange} className="w-full border p-2 rounded text-sm" required/>
//                         <input name="phys" type="number" step="0.1" min="0" max="10" placeholder="Physical" value={stats.phys} onChange={handleChange} className="w-full border p-2 rounded text-sm" required/>
//                         <input name="ment" type="number" step="0.1" min="0" max="10" placeholder="Mental" value={stats.ment} onChange={handleChange} className="w-full border p-2 rounded text-sm" required/>
//                         <input name="att" type="number" step="0.1" min="0" max="10" placeholder="Attacking" value={stats.att} onChange={handleChange} className="w-full border p-2 rounded text-sm" required/>
//                         <input name="def" type="number" step="0.1" min="0" max="10" placeholder="Defending" value={stats.def} onChange={handleChange} className="w-full border p-2 rounded text-sm" required/>
//                     </div>
//                 </div>

//                 {/* 3. Homework Section (Same as before) */}
//                 <div className="bg-teal-50 p-3 rounded-md border border-teal-100">
//                     <h3 className="text-xs font-bold text-teal-700 uppercase mb-2">Assign Drills from Database</h3>
                    
//                     <div className="mb-3">
//                         <label className="text-[10px] font-bold text-gray-500 uppercase">Primary Drill</label>
//                         <select title="primarydrill" name="hw1_select" className="w-full border p-2 rounded mb-1 text-sm bg-white" required>
//                             <option value="">Select Drill...</option>
//                             {MASTER_DRILLS.map(drill => (
//                                 <option key={drill.id} value={drill.name}>{drill.name}</option>
//                             ))}
//                         </select>
//                         <input name="hw1_desc" placeholder="Details (e.g. 3 sets of 10)" className="w-full border p-2 rounded text-sm" required />
//                     </div>
                    
//                     <div>
//                         <label className="text-[10px] font-bold text-gray-500 uppercase">Secondary Drill (Optional)</label>
//                         <select title="secondary drill" name="hw2_select" className="w-full border p-2 rounded mb-1 text-sm bg-white">
//                             <option value="">Select Drill...</option>
//                             {MASTER_DRILLS.map(drill => (
//                                 <option key={drill.id} value={drill.name}>{drill.name}</option>
//                             ))}
//                         </select>
//                         <input name="hw2_desc" placeholder="Details (e.g. 15 mins)" className="w-full border p-2 rounded text-sm" />
//                     </div>
//                 </div>

//                 <div className="flex gap-3 pt-2">
//                    <button type="button" onClick={() => setOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-md">Cancel</button>
//                    <button type="submit" disabled={loading} className="flex-1 bg-teal-600 text-white py-2.5 rounded-md hover:bg-teal-700 font-bold shadow-md">
//                       {loading ? "Generating..." : "Save & Update Stats"}
//                    </button>
//                 </div>
//              </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default FlipCardForm;
"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { Loader2, Save, X, Search, BookOpen, PlayCircle, Info, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { createFlipCard } from "@/lib/actions";
import { toast } from "react-toastify";

// --- TYPES ---
type DrillType = {
    id: string;
    name: string;
    category: string;
    level?: string;
    videoUrl?: string | null;
    description?: string;
};

// --- CONFIG ---
const CATEGORIES = {
  technical: ["Ball Control", "Dribbling", "Passing Accuracy", "Shooting", "First Touch", "Weak Foot Use"],
  tactical:  ["Positioning", "Decision-Making", "Game Awareness", "Support Play", "Transition", "Adaptability"],
  physical:  ["Speed", "Agility", "Balance", "Strength", "Endurance", "Coordination"],
  mental:    ["Concentration", "Confidence", "Communication", "Teamwork", "Resilience", "Motivation"],
};

// --- SLIDER COMPONENT ---
const SkillSlider = ({ label, current, goal, onChange }: { label: string, current: number, goal: number, onChange: (type: 'current'|'goal', val: number) => void }) => {
  return (
    <div className="flex items-center justify-between mb-3 hover:bg-[#1f2430]/50 p-1.5 rounded-lg transition-colors group">
      <span className="text-[12px] font-medium text-gray-400 group-hover:text-gray-200 w-[130px] truncate">{label}</span>
      <div className="flex gap-4 flex-1 justify-end">
          <div className="flex items-center gap-2">
            <input type="range" min="1" max="10" step="1" value={current} onChange={(e) => onChange('current', Number(e.target.value))} className="w-[60px] h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            <span className="text-blue-400 font-bold text-xs w-4 text-center">{current}</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="range" min="1" max="10" step="1" value={goal} onChange={(e) => onChange('goal', Number(e.target.value))} className="w-[60px] h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white" />
            <span className="text-white font-bold text-xs w-4 text-center">{goal}</span>
          </div>
      </div>
    </div>
  );
};

// --- MAIN FORM ---
const FlipCardForm = ({ 
  playerId, 
  coachId, 
  setOpen,
  drillsList = [] 
}: { 
  playerId: string; 
  coachId: string; 
  setOpen?: (val: boolean) => void;
  drillsList?: DrillType[]; 
}) => {
  
  // 'setValue' is used to auto-fill the form fields programmatically
  const { register, handleSubmit, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // State for Drill Preview (Video/Tags)
  const [selectedDrill, setSelectedDrill] = useState<DrillType | null>(null);

  // Stats State
  const [stats, setStats] = useState({
    attacking: { current: 6, goal: 8 },
    defending: { current: 6, goal: 8 },
    technical: CATEGORIES.technical.map(name => ({ name, current: 5, goal: 7 })),
    tactical:  CATEGORIES.tactical.map(name => ({ name, current: 5, goal: 7 })),
    physical:  CATEGORIES.physical.map(name => ({ name, current: 5, goal: 7 })),
    mental:    CATEGORIES.mental.map(name => ({ name, current: 5, goal: 7 })),
  });

  const calculateOverall = () => {
    let total = stats.attacking.current + stats.defending.current;
    let count = 2;
    [stats.technical, stats.tactical, stats.physical, stats.mental].forEach(cat => {
      cat.forEach(skill => { total += skill.current; count++; });
    });
    return (total / count).toFixed(1);
  };

  const updateStat = (category: keyof typeof stats, index: number | null, type: 'current'|'goal', val: number) => {
    setStats(prev => {
      if (category === 'attacking' || category === 'defending') {
        return { ...prev, [category]: { ...prev[category], [type]: val } };
      }
      const newArray = [...(prev[category] as any[])];
      if (index !== null) newArray[index] = { ...newArray[index], [type]: val };
      return { ...prev, [category]: newArray };
    });
  };

  // 🔥 MAGIC FUNCTION: Handle Dropdown Selection
  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const drillId = e.target.value;
      if (!drillId) return;

      // 1. Find the drill in the list
      const drill = drillsList.find(d => d.id === drillId);

      if (drill) {
          // 2. AUTO-FILL FIELDS
          setValue("drillPrimary", drill.name);
          
          // Truncate description slightly if too long, or use a default
          const instructions = drill.description 
             ? drill.description.substring(0, 150) + (drill.description.length > 150 ? "..." : "")
             : `Focus on ${drill.category} mechanics.`;
          
          setValue("drillPrimaryDetails", instructions);

          // 3. Update State for Preview Card
          setSelectedDrill(drill);
          
          toast.success("Auto-filled from Library!");
      }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      const payload = {
        overallScore: calculateOverall(),
        stats: {
          technical: stats.technical,
          tactical: stats.tactical,
          physical: stats.physical,
          mental: stats.mental,
          attacking: stats.attacking, 
          defending: stats.defending 
        },
        drills: {
          primary: data.drillPrimary,
          primaryDetails: data.drillPrimaryDetails,
          secondary: data.drillSecondary,
          secondaryDetails: data.drillSecondaryDetails
        }
      };

      const res = await createFlipCard(playerId, coachId, payload); 
      
      if(res.success){
          toast.success("Card Generated Successfully!");
          if (setOpen) setOpen(false);
          router.refresh();
      } else {
          toast.error(res.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create card");
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="flex flex-col h-[85vh] bg-[#0f1115] text-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1f2430] bg-[#171a21] flex justify-between items-center shrink-0">
        <div>
           <h2 className="text-base font-bold text-white">New Evaluation</h2>
           <p className="text-[10px] text-gray-500">Assign Drills & Set Stats</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="bg-[#1f2430] border border-gray-700 px-3 py-1 rounded text-center">
                <span className="text-[10px] text-gray-400 block">OVR</span>
                <span className="text-lg font-bold text-blue-500 leading-none">{calculateOverall()}</span>
            </div>
            <button onClick={() => setOpen && setOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
      </div>

      {/* Body */}
      <form onSubmit={onSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        
        {/* Sliders Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Attacking / Defending */}
             <div className="bg-[#171a21] p-4 rounded-xl border border-[#1f2430] md:col-span-2">
                <h3 className="text-xs font-bold text-gray-300 uppercase mb-3 border-l-2 border-purple-500 pl-2">Game Impact</h3>
                <SkillSlider label="Attacking" current={stats.attacking.current} goal={stats.attacking.goal} onChange={(t, v) => updateStat('attacking', null, t, v)} />
                <SkillSlider label="Defending" current={stats.defending.current} goal={stats.defending.goal} onChange={(t, v) => updateStat('defending', null, t, v)} />
             </div>
             
             {/* Categories */}
             {[
                 { id: 'technical', color: 'border-blue-500', title: 'Technical' },
                 { id: 'tactical', color: 'border-teal-500', title: 'Tactical' },
                 { id: 'physical', color: 'border-yellow-500', title: 'Physical' },
                 { id: 'mental', color: 'border-red-500', title: 'Mental' }
             ].map((cat) => (
                 <div key={cat.id} className="bg-[#171a21] p-4 rounded-xl border border-[#1f2430]">
                     <h3 className={`text-xs font-bold text-gray-300 uppercase mb-3 border-l-2 ${cat.color} pl-2`}>{cat.title}</h3>
                     {(stats as any)[cat.id].map((s: any, i: number) => (
                         <SkillSlider key={s.name} label={s.name} current={s.current} goal={s.goal} onChange={(t, v) => updateStat(cat.id as any, i, t, v)} />
                     ))}
                 </div>
             ))}
        </div>

        {/* 🔥 DRILL LIBRARY SECTION */}
        <div className="bg-[#171a21] p-5 rounded-xl border border-[#1f2430] border-l-4 border-green-500">
           <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                 <BookOpen size={16} className="text-green-500"/> Drill Library
               </h3>
               <span className="text-[10px] text-gray-500 bg-black/30 px-2 py-1 rounded border border-gray-800">
                 {drillsList.length} Available
               </span>
           </div>

           {/* ⚡ NEW: FAST LOAD DROPDOWN (Like DrillForm) */}
           <div className="mb-6 bg-green-900/10 p-3 rounded-lg border border-green-500/20">
               <label className="text-[10px] font-bold text-green-400 mb-1 flex items-center gap-1">
                  <Zap size={12} /> FAST LOAD (AUTO-FILL)
               </label>
               <select 
                  onChange={handleTemplateSelect}
                  className="w-full bg-[#0f1115] text-white p-2.5 rounded border border-green-500/30 text-sm outline-none focus:border-green-500 cursor-pointer"
               >
                  <option value="">-- Select a Master Drill --</option>
                  
                  {/* 🔥 ENSURE THIS MAP HAS NO SLICE OR LIMIT */}
                  {drillsList.map(drill => (
                      <option key={drill.id} value={drill.id}>
                          {drill.name} ({drill.category})
                      </option>
                  ))}
               </select>
           </div>

           <div className="space-y-4">
               {/* Primary Input (Gets Filled automatically) */}
               <div className="relative">
                   <label className="text-[10px] font-bold text-gray-400 mb-1 block">PRIMARY DRILL NAME</label>
                   <input 
                      {...register("drillPrimary")} 
                      placeholder="Drill name will appear here..." 
                      className="w-full bg-[#0f1115] text-white p-3 rounded-lg border border-gray-700 text-sm outline-none focus:border-green-500 transition-colors placeholder:text-gray-600"
                   />

                   {/* PREVIEW CARD: Appears when a drill is selected */}
                   {selectedDrill && (
                      <div className="mt-3 bg-green-900/10 border border-green-500/20 p-3 rounded-lg flex items-start justify-between animate-in fade-in slide-in-from-top-1">
                          <div>
                             <span className="text-green-400 text-xs font-bold flex items-center gap-1.5">
                                <Info size={14}/> {selectedDrill.name}
                             </span>
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] bg-green-500/10 text-green-300 px-1.5 py-0.5 rounded border border-green-500/20">
                                   {selectedDrill.category}
                                </span>
                                {selectedDrill.level && (
                                   <span className="text-[10px] bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/20">
                                      {selectedDrill.level}
                                   </span>
                                )}
                             </div>
                          </div>
                          {selectedDrill.videoUrl && (
                             <a 
                               href={selectedDrill.videoUrl} 
                               target="_blank" 
                               className="text-xs bg-[#0f1115] border border-gray-700 text-white px-3 py-1.5 rounded flex items-center gap-1 hover:border-green-500 transition shadow-sm"
                             >
                                <PlayCircle size={12} className="text-red-500"/> Watch
                             </a>
                          )}
                      </div>
                   )}

                   {/* Instructions Input (Gets Filled automatically) */}
                   <input 
                      {...register("drillPrimaryDetails")} 
                      placeholder="Details / Description..." 
                      className="w-full bg-[#0f1115] mt-2 p-2 rounded border border-gray-700 text-xs text-gray-400 outline-none focus:border-gray-500 transition-colors"
                   />
               </div>

               {/* Secondary Input */}
               <div className="relative pt-2 border-t border-[#26324b] mt-2">
                   <label className="text-[10px] font-bold text-gray-500 mb-1 block">SECONDARY (OPTIONAL)</label>
                   <input 
                      {...register("drillSecondary")} 
                      placeholder="Type drill name..." 
                      className="w-full bg-[#0f1115] text-white p-2.5 rounded-lg border border-gray-700 text-sm outline-none focus:border-gray-500 transition-colors placeholder:text-gray-600"
                   />
                   <input 
                      {...register("drillSecondaryDetails")} 
                      placeholder="Details..." 
                      className="w-full bg-[#0f1115] mt-2 p-2 rounded border border-gray-700 text-xs text-gray-400 outline-none focus:border-gray-500" 
                   />
               </div>
           </div>
        </div>

      </form>

      {/* Footer */}
      <div className="p-4 bg-[#171a21] border-t border-[#1f2430] flex justify-end shrink-0">
          <button 
            onClick={onSubmit} 
            disabled={loading} 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            Generate Card
          </button>
      </div>
    </div>
  );
};

export default FlipCardForm;