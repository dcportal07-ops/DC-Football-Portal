"use client";

import { useState } from "react";
import { Plus, LockKeyhole, Sparkles } from "lucide-react";
import PlayerFlipCard from "@/components/PlayerFlipCard";
import FlipCardForm from "@/components/forms/FlipCardForm";

// Dummy Data
const DUMMY_DATA = {
  overallScore: "?",
  stats: {
    technical: [{name:"Skill 1", current:5, goal:8}],
    tactical: [{name:"Skill 1", current:5, goal:8}],
    physical: [{name:"Skill 1", current:5, goal:8}],
    mental: [{name:"Skill 1", current:5, goal:8}],
    attacking: { current: 0 },
    defending: { current: 0 },
  },
  drills: { primary: "Locked", primaryDetails: "..." }
};

const PlayerCardSection = ({ 
  latestCard, 
  player, 
  role, 
  currentCoachId,
  drillsList = [] // ✅ 1. Receive Drills Here
}: { 
  latestCard: any, 
  player: any, 
  role: string, 
  currentCoachId: string | null,
  drillsList?: any[] // Type Definition
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Sparkles size={14} className="text-yellow-500" />
            Performance Card
          </h2>
        </div>
        {(role === "admin" || role === "coach") && currentCoachId && (
          <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-[#0f1115] hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md">
            <Plus size={14} /> Generate
          </button>
        )}
      </div>

      {/* Card Display */}
      <div className="relative">
        {latestCard ? (
          <PlayerFlipCard
            data={latestCard}
            playerName={player.user.name}
            playerImg={player.user.photo || ""}
            playerId={player.user.userCode}
          />
        ) : (
          <div className="relative group">
            <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center text-center p-6 transition-all">
               <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3 backdrop-blur-md border border-white/20">
                  <LockKeyhole className="text-white" size={20} />
               </div>
               <h3 className="text-white font-bold text-lg">No Active Card</h3>
               <p className="text-gray-300 text-xs mt-1 mb-4">Create a report to unlock stats.</p>
               {(role === "admin" || role === "coach") && (
                 <button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg">
                   Create First Report
                 </button>
               )}
            </div>
            <div className="opacity-40 pointer-events-none grayscale blur-sm">
              <PlayerFlipCard data={DUMMY_DATA} playerName="?" playerImg="" playerId="" />
            </div>
          </div>
        )}
      </div>

      {/* POPUP MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-[#0f1115] rounded-2xl shadow-2xl border border-[#1f2430] overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* ✅ 2. PASS DRILLS TO FORM */}
            <FlipCardForm 
              playerId={player.id} 
              coachId={currentCoachId || ""} 
              setOpen={setIsOpen} 
              drillsList={drillsList} // <--- YE ZAROORI HAI
            />
            
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCardSection;