"use client";

import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createEvaluation, updateEvaluation, getAllPlayers, getAllCoaches } from "@/lib/actions"; 
import { toast } from "sonner";
import { Loader2, User, UserCheck } from "lucide-react";

// --- SCHEMA ---
const schema = z.object({
  playerId: z.string().min(1, { message: "Player is required" }),
  coachId: z.string().min(1, { message: "Coach is required" }),
  
  // Ratings (0-100)
  technical: z.coerce.number().min(0).max(100),
  tactical: z.coerce.number().min(0).max(100),
  physical: z.coerce.number().min(0).max(100),
  mental: z.coerce.number().min(0).max(100),
  attacking: z.coerce.number().min(0).max(100).optional(),
  defending: z.coerce.number().min(0).max(100).optional(),
  
  note: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const EvaluationForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State for Dropdowns
  const [players, setPlayers] = useState<{id: string, name: string}[]>([]);
  const [coaches, setCoaches] = useState<{id: string, name: string}[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    // ✅ FIX 1: Cast resolver to any to bypass strict type mismatch with coercion
    resolver: zodResolver(schema) as any,
    defaultValues: {
      playerId: data?.playerId || "",
      coachId: data?.coachId || "",
      technical: data?.technical || data?.overallJson?.technical || 0,
      tactical: data?.tactical || data?.overallJson?.tactical || 0,
      physical: data?.physical || data?.overallJson?.physical || 0,
      mental: data?.mental || data?.overallJson?.mental || 0,
      attacking: data?.attacking || data?.overallJson?.attacking || 0,
      defending: data?.defending || data?.overallJson?.defending || 0,
      note: data?.note || "",
    },
  });

  // ✅ FIX 2: Correctly map the returned data to state type
  useEffect(() => {
    const fetchData = async () => {
      // getAllPlayers returns nested objects sometimes, we map it flat
      const pData: any[] = await getAllPlayers();
      const cData: any[] = await getAllCoaches();
      
      const formattedPlayers = pData.map(p => ({
          id: p.id,
          name: p.user?.name || p.name || "Unknown"
      }));
      
      const formattedCoaches = cData.map(c => ({
          id: c.id,
          name: c.user?.name || c.name || "Unknown"
      }));

      setPlayers(formattedPlayers);
      setCoaches(formattedCoaches);
    };
    fetchData();
  }, []);

  // ✅ FIX 3: Explicitly type the SubmitHandler
  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    setLoading(true);
    
    const payload = {
        id: data?.id,
        playerId: formData.playerId,
        coachId: formData.coachId,
        note: formData.note,
        ratingsJson: {
            technical: formData.technical,
            tactical: formData.tactical,
            physical: formData.physical,
            mental: formData.mental,
            attacking: formData.attacking || 0,
            defending: formData.defending || 0
        }
    };

    try {
      const action = type === "create" ? createEvaluation : updateEvaluation;
      const result = await action(payload);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
        if (setOpen) setOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const InputRow = ({ label, name }: { label: string, name: keyof Inputs }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase">{label}</label>
        <input 
            type="number" 
            {...register(name)} 
            className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none focus:border-blue-500"
        />
        {errors[name]?.message && <span className="text-xs text-red-500">{errors[name]?.message?.toString()}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-800">
          {type === "create" ? "New Evaluation" : "Edit Evaluation"}
        </h1>
        <p className="text-sm text-gray-500">Record player performance stats.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                <User size={14}/> Player
            </label>
            <select 
                {...register("playerId")} 
                className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2.5 outline-none"
                disabled={type === "update"} 
            >
                <option value="">Select Player...</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.playerId && <span className="text-xs text-red-500">{errors.playerId.message}</span>}
         </div>

         <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                <UserCheck size={14}/> Coach
            </label>
            <select 
                {...register("coachId")}
                className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2.5 outline-none"
            >
                <option value="">Select Coach...</option>
                {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.coachId && <span className="text-xs text-red-500">{errors.coachId.message}</span>}
         </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
         <h3 className="text-sm font-bold text-gray-700 mb-3">Performance Metrics (0-100)</h3>
         <div className="grid grid-cols-2 gap-4">
            <InputRow label="Technical" name="technical" />
            <InputRow label="Tactical" name="tactical" />
            <InputRow label="Physical" name="physical" />
            <InputRow label="Mental" name="mental" />
            <InputRow label="Attacking" name="attacking" />
            <InputRow label="Defending" name="defending" />
         </div>
      </div>

      <div className="flex flex-col gap-1">
         <label className="text-xs font-semibold text-gray-500 uppercase">Coach Notes</label>
         <textarea 
            {...register("note")} 
            rows={3}
            className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none focus:border-blue-500 resize-none"
            placeholder="Additional comments..."
         />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button 
          type="button" 
          onClick={() => setOpen && setOpen(false)} 
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          {type === "create" ? "Submit Evaluation" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default EvaluationForm;