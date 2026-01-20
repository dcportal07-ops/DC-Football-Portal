"use client";

import { useState, useEffect } from "react";
import { getAllPlayers, assignDrillToPlayer } from "@/lib/actions";
import { toast } from "sonner";
import { User, Loader2, Send } from "lucide-react";

const AssignDrillButton = ({ 
  drillId, 
  drillName, 
  coachId 
}: { 
  drillId: string; 
  drillName: string; 
  coachId: string; 
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");

  // Fetch players when modal opens
  useEffect(() => {
    if (open && players.length === 0) {
      const fetchP = async () => {
        const res = await getAllPlayers();
        // Map to flat structure
        setPlayers(res.map((p: any) => ({ id: p.id, name: p.name || p.user.name })));
      };
      fetchP();
    }
  }, [open, players.length]);

  const handleAssign = async () => {
    if (!selectedPlayer) {
      toast.error("Please select a player first.");
      return;
    }

    setLoading(true);
    try {
      const result = await assignDrillToPlayer({
        drillId,
        drillName,
        playerId: selectedPlayer,
        coachId,
      });

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        setSelectedPlayer("");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. THE TRIGGER BUTTON */}
      <button 
        onClick={() => setOpen(true)} 
        className="p-3 bg-blue-50 rounded-md text-xs text-blue-600 hover:bg-blue-100 flex items-center justify-between group transition-colors w-full"
      >
        <span className="font-medium">Assign to Player</span>
        <span className="text-blue-400 group-hover:text-blue-600 font-bold">+</span>
      </button>

      {/* 2. THE POPUP MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="bg-blue-600 p-4 flex justify-between items-center">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <Send size={18} /> Assign Drill
                </h3>
                <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase mb-1">Selected Drill</p>
                    <p className="text-gray-800 font-semibold">{drillName}</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <User size={16} className="text-gray-400"/> Select Player
                    </label>
                    <select 
                    title="select player"
                        value={selectedPlayer}
                        onChange={(e) => setSelectedPlayer(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="">-- Choose a player --</option>
                        {players.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="pt-2 flex gap-3">
                    <button 
                        onClick={() => setOpen(false)}
                        className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleAssign}
                        disabled={loading}
                        className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4"/> : "Confirm Assignment"}
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssignDrillButton;