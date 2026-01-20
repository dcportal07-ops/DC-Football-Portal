"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { 
  createAssignment, 
  updateAssignment, 
  deleteAssignment, 
  getMasterDrillList, 
  getAllPlayers, 
  getAllCoaches 
} from "@/lib/actions";
import { 
  User, Target, Clock, FileText, Plus, Trash2, Dumbbell, Loader2, Layers, Users 
} from "lucide-react";
import { Button } from "../ui/button";

// --- SCHEMA ---
const drillItemSchema = z.object({
  code: z.string().min(1, "Drill required"), 
  name: z.string().optional(),
  suggestedSets: z.coerce.string().min(1, "Sets required"),
  suggestedReps: z.coerce.string().min(1, "Reps required"),
});

const schema = z.object({
  playerId: z.string().min(1, { message: "Player required" }),
  coachId: z.string().min(1, { message: "Coach required" }),
  template: z.string().min(1, { message: "Template name required" }),
  skillFocus: z.string().min(1, { message: "Skill focus required" }),
  
  // Coerce Numbers safely
  currentRating: z.coerce.number().optional(),
  goalRating: z.coerce.number().optional(),
  estimated_total_time_min: z.coerce.number().min(1, "Time required"),
  
  coachFeedback: z.string().optional(),
  status: z.enum(["PENDING", "SENT", "COMPLETED"]),
  items: z.array(drillItemSchema).min(1, { message: "Add at least one drill" }),
});

type Inputs = z.infer<typeof schema>;

const AssignmentForm = ({
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
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Dropdown Data
  const [drillOptions, setDrillOptions] = useState<{id: string, name: string, category: string, code: string}[]>([]);
  const [playerOptions, setPlayerOptions] = useState<{id: string, user: {name: string}, team: {name: string} | null}[]>([]);
  const [coachOptions, setCoachOptions] = useState<{id: string, name: string}[]>([]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    // ✅ FIX: Cast resolver to 'any' to bypass coercion type mismatch
    resolver: zodResolver(schema) as any,
    defaultValues: {
      playerId: data?.playerId || "",
      coachId: data?.coachId || "",
      template: data?.template || "",
      skillFocus: data?.skillFocus || "",
      currentRating: data?.currentRating || 0,
      goalRating: data?.goalRating || 0,
      estimated_total_time_min: data?.estimatedTimeMin || 30,
      status: data?.status || "PENDING",
      coachFeedback: data?.coachFeedback || "",
      items: data?.drillItems || [{ code: "", name: "", suggestedSets: "3", suggestedReps: "10" }], 
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // 1. FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
        const [drills, players, coaches] = await Promise.all([
            getMasterDrillList(),
            getAllPlayers(),
            getAllCoaches()
        ]);
        
        setDrillOptions(drills as any);
        setPlayerOptions(players as any);
        setCoachOptions(coaches as any);
    };
    fetchData();
  }, []);

  // 2. DRILL SELECTION LOGIC
  const handleDrillSelect = (index: number, drillId: string) => {
    const selectedDrill = drillOptions.find(d => d.id === drillId);
    if (selectedDrill) {
        setValue(`items.${index}.code`, selectedDrill.id); // Storing ID as Code
        setValue(`items.${index}.name`, selectedDrill.name);
    }
  };

  // 3. SUBMIT
  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    setLoading(true);
    try {
        const finalData = {
            ...formData,
            id: data?.id,
            items: formData.items, 
        };

        const action = type === "create" ? createAssignment : updateAssignment;
        const result = await action(finalData);

        if (result.success) {
            router.refresh();
            if (setOpen) setOpen(false); 
        } else {
            alert("Error: " + result.message);
        }
    } catch (err) {
        console.error(err);
        alert("Something went wrong");
    } finally {
        setLoading(false);
    }
  };

  // 4. DELETE
  const handleDelete = async () => {
    if (!data?.id) return;
    if (!confirm("Are you sure?")) return;

    setIsDeleting(true);
    try {
        const result = await deleteAssignment(data.id);
        if (result.success) {
            router.refresh();
            if (setOpen) setOpen(false);
        } else {
            alert("Delete failed: " + result.message);
        }
    } catch (e) {
        alert("Delete failed");
    } finally {
        setIsDeleting(false);
    }
  };

  // Modern Input Helper
  const ModernInput = ({ label, name, icon: Icon, type = "text", placeholder, error }: any) => (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          {...register(name)}
          placeholder={placeholder}
          aria-label={label}
          className={`w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2.5 outline-none ${
            Icon ? "pl-10" : ""
          } ${error ? "border-red-400 bg-red-50" : ""}`}
        />
      </div>
      {error && <span className="text-xs text-red-500 font-medium">{error.message}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-800 border-b pb-4">
        {type === "create" ? "Assign Homework" : "Edit Assignment"}
      </h1>

      {/* --- DETAILS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Player</label>
            <select 
                {...register("playerId")}
                aria-label="Select Player"
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
                <option value="">Select Player...</option>
                {playerOptions.map(p => (
                    <option key={p.id} value={p.id}>{p.user.name} {p.team ? `(${p.team.name})` : ""}</option>
                ))}
            </select>
            {errors.playerId && <p className="text-xs text-red-500">{errors.playerId.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Coach</label>
            <select 
                {...register("coachId")}
                aria-label="Select Coach"
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
                <option value="">Select Coach...</option>
                {coachOptions.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
            {errors.coachId && <p className="text-xs text-red-500">{errors.coachId.message}</p>}
          </div>

          <ModernInput label="Template Name" name="template" icon={Layers} placeholder="e.g. Week 1 Basics" error={errors.template} />
          
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
            <select {...register("status")} aria-label="Status" className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none">
                <option value="PENDING">Pending</option>
                <option value="SENT">Sent</option>
                <option value="COMPLETED">Completed</option>
            </select>
          </div>
      </div>

      {/* --- GOALS --- */}
      <div className="grid grid-cols-3 gap-5 border-t pt-4">
           <ModernInput label="Focus" name="skillFocus" icon={Target} placeholder="Dribbling" error={errors.skillFocus} />
           <ModernInput label="Current Rating" name="currentRating" type="number" placeholder="4" error={errors.currentRating} />
           <ModernInput label="Goal Rating" name="goalRating" type="number" placeholder="8" error={errors.goalRating} />
      </div>
      <ModernInput label="Time (Min)" name="estimated_total_time_min" icon={Clock} type="number" placeholder="30" error={errors.estimated_total_time_min} />

      {/* --- DRILLS --- */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
         <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Dumbbell size={16} /> Drill Sequence</h3>
            <Button type="button" onClick={() => append({ code: "", name: "", suggestedSets: "3", suggestedReps: "10" })} size="sm" variant="outline" className="text-xs h-7"><Plus size={12} className="mr-1" /> Add</Button>
         </div>

         <div className="space-y-3">
            {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-end">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Drill</label>
                        <select 
                            onChange={(e) => handleDrillSelect(index, e.target.value)}
                            aria-label={`Select Drill ${index + 1}`}
                            className="w-full border rounded p-2 text-sm bg-white"
                        >
                            <option value="">-- Select --</option>
                            {drillOptions.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-20"><ModernInput label="Sets" name={`items.${index}.suggestedSets`} placeholder="3" /></div>
                    <div className="w-20"><ModernInput label="Reps" name={`items.${index}.suggestedReps`} placeholder="10" /></div>
                    <div className="pb-1">
                        <Button type="button" onClick={() => remove(index)} size="icon" variant="ghost" className="text-red-500 h-8 w-8"><Trash2 size={16} /></Button>
                    </div>
                </div>
            ))}
         </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        {type === "update" && (
            <button type="button" onClick={handleDelete} disabled={isDeleting} className="mr-auto text-red-600 text-sm flex items-center gap-1 hover:underline">
                {isDeleting ? <Loader2 className="animate-spin w-3 h-3"/> : <Trash2 size={14}/>} Delete
            </button>
        )}
        <button type="button" onClick={() => setOpen && setOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
        <button type="submit" disabled={loading} className="px-6 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2">
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            {type === "create" ? "Assign" : "Save"}
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;