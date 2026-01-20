"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createTeam, updateTeam, getAllCoaches, getAllClubs } from "@/lib/actions"; // ✅ Import getAllClubs
import { toast } from "sonner";
import {
  Shield,
  Hash,
  Users,
  Loader2,
  Trophy,
  UserCheck,
  Landmark // Icon for Club
} from "lucide-react";

// --- SCHEMA ---
const schema = z.object({
  name: z.string().min(3, { message: "Team name must be at least 3 chars" }),
  code: z.string().min(2, { message: "Team code is required" }),
  ageGroup: z.string().min(1, { message: "Age group is required" }),
  coachId: z.string().optional(),
  clubId: z.string().optional(), // ✅ Added Club ID
});

type Inputs = z.infer<typeof schema>;

const TeamForm = ({
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
  const [coaches, setCoaches] = useState<{ id: string; name: string }[]>([]);
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]); // ✅ State for Clubs

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: data?.name,
      code: data?.code,
      ageGroup: data?.ageGroup,
      coachId: data?.coaches && data.coaches.length > 0 ? data.coaches[0].coachId : "", 
      clubId: data?.clubId || "", // ✅ Pre-fill Club
    },
  });

  // ✅ FETCH COACHES AND CLUBS ON MOUNT
  useEffect(() => {
    const fetchData = async () => {
        const [coachesRes, clubsRes] = await Promise.all([
            getAllCoaches(),
            getAllClubs()
        ]);
        setCoaches(coachesRes);
        setClubs(clubsRes); // Set Clubs
    };
    fetchData();
  }, []);

  const onSubmit = async (formData: Inputs) => {
    setLoading(true);
    const finalData = type === "update" ? { ...formData, id: data.id } : formData;

    try {
      const action = type === "create" ? createTeam : updateTeam;
      const result = await action(finalData);

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

  // --- REUSABLE INPUT ---
  const ModernInput = ({ label, name, icon: Icon, type = "text", placeholder }: any) => (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          {...register(name)}
          placeholder={placeholder}
          className={`w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2.5 outline-none ${
            Icon ? "pl-10" : ""
          } ${errors[name as keyof Inputs] ? "border-red-400 bg-red-50" : ""}`}
        />
      </div>
      {errors[name as keyof Inputs]?.message && (
        <span className="text-xs text-red-500">{errors[name as keyof Inputs]?.message?.toString()}</span>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-800">
          {type === "create" ? "Create New Team" : "Edit Team Details"}
        </h1>
        <p className="text-sm text-gray-500">
          Update team details, age group, club affiliation, or coaching staff.
        </p>
      </div>

      {/* SECTION 1: IDENTITY */}
      <div className="space-y-4">
         <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-100 rounded-md text-blue-600"><Shield size={16} /></div>
            <h2 className="text-sm font-bold text-gray-700">Team Identity</h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
               <ModernInput 
                 label="Team Name" 
                 name="name" 
                 icon={Trophy} 
                 placeholder="e.g. U14 Gold" 
               />
            </div>
            
            <ModernInput 
              label="Team Code (Unique ID)" 
              name="code" 
              icon={Hash} 
              placeholder="e.g. U14_GOLD" 
            />

            {/* ✅ CLUB DROPDOWN */}
            <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Affiliated Club</label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Landmark size={18} /></div>
                    <select 
                        {...register("clubId")} 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2.5 pl-10 outline-none cursor-pointer"
                    >
                        <option value="">-- No Club --</option>
                        {clubs.map((club) => (
                            <option key={club.id} value={club.id}>
                                {club.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
         </div>
      </div>

      {/* SECTION 2: STAFF & COMPOSITION */}
      <div className="space-y-4 pt-2 border-t border-gray-100">
         <div className="flex items-center gap-2 mb-2 pt-2">
            <div className="p-1.5 bg-purple-100 rounded-md text-purple-600"><Users size={16} /></div>
            <h2 className="text-sm font-bold text-gray-700">Composition & Staff</h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ModernInput 
              label="Age Group" 
              name="ageGroup" 
              icon={Users} 
              placeholder="e.g. 9-12" 
            />

            {/* HEAD COACH DROPDOWN */}
            <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Head Coach (Manager)</label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><UserCheck size={18} /></div>
                    <select 
                        {...register("coachId")} 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2.5 pl-10 outline-none cursor-pointer"
                    >
                        <option value="">Select Coach...</option>
                        {coaches.map((coach) => (
                            <option key={coach.id} value={coach.id}>
                                {coach.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
         </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
        <button 
          type="button" 
          onClick={() => setOpen && setOpen(false)} 
          className="hidden md:block px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full md:w-auto px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          {type === "create" ? "Create Team" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default TeamForm;