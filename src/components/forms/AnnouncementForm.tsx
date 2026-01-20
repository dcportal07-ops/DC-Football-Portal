"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/lib/actions";
import { toast } from "sonner"; 
import { 
  Calendar, 
  Users, 
  Loader2, 
  Trash2,
  Type,
  Megaphone,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

// --- SCHEMA ---
const schema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 chars" }),
  audience: z.string().min(1, { message: "Audience is required" }),
  date: z.string().min(1, { message: "Date is required" }),
});

type Inputs = z.infer<typeof schema>;

const AnnouncementForm = ({
  type,
  data,
}: {
  type: "create" | "update";
  data?: any;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...data,
      date: data?.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    },
  });

  // ✅ 1. HANDLE SUBMIT
  const onSubmit = async (formData: Inputs) => {
    setLoading(true);
    try {
        const finalData = { ...formData, id: data?.id };
        const action = type === "create" ? createAnnouncement : updateAnnouncement;
        const result = await action(finalData);

        if (result.success) {
            toast.success(type === "create" ? "Announcement Posted!" : "Changes Saved", {
                description: result.message,
                icon: <CheckCircle2 className="text-green-500" />,
            });
            router.refresh();
            window.location.reload();
        } else {
            toast.error("Operation Failed", {
                description: result.message,
                icon: <AlertCircle className="text-red-500" />,
            });
        }
    } catch (err) {
        toast.error("System Error", { description: "Something went wrong." });
    } finally {
        setLoading(false);
    }
  };

  // ✅ 2. HANDLE DELETE
  const handleDelete = async () => {
    if (!data?.id) return;
    
    // Custom Toast for Confirmation
    toast.custom((t) => (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-100 flex flex-col gap-3 min-w-[300px]">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-full">
                <Trash2 size={16} />
            </div>
            <div>
                <p className="font-bold text-gray-800 text-sm">Delete Announcement?</p>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
            </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => toast.dismiss(t)} 
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => { toast.dismiss(t); performDelete(); }} 
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    ));
  };

  const performDelete = async () => {
    setIsDeleting(true);
    try {
        const result = await deleteAnnouncement(data.id);
        if (result.success) {
            toast.success("Deleted", { description: "Announcement removed successfully." });
            router.refresh();
            window.location.reload(); 
        } else {
            toast.error("Failed", { description: result.message });
        }
    } catch (error) {
        toast.error("Error", { description: "Delete failed." });
    } finally {
        setIsDeleting(false);
    }
  };

  // --- MODERN INPUT COMPONENT (Strictly Typed) ---
  const ModernInput = ({ 
    label, 
    name, 
    icon: Icon, 
    type = "text", 
    placeholder, 
    options 
  }: {
    label: string;
    name: keyof Inputs; // 🔥 THIS FIXES THE TS ERROR
    icon?: any;
    type?: string;
    placeholder?: string;
    options?: string[];
  }) => (
    <div className="group">
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block group-focus-within:text-blue-600 transition-colors">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        
        {type === "select" ? (
            <div className="relative">
                <select
                    {...register(name)}
                    className={`w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl block p-3 transition-all outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white appearance-none cursor-pointer ${Icon ? "pl-10" : ""}`}
                >
                    <option value="">Select Option...</option>
                    {options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {/* Custom Arrow for Select */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>
        ) : (
            <input
                type={type}
                {...register(name)}
                placeholder={placeholder}
                className={`w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl block p-3 transition-all outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white ${Icon ? "pl-10" : ""}`}
            />
        )}
      </div>
      {/* ✅ TypeScript is happy now because `name` is strictly typed */}
      {errors[name]?.message && (
        <span className="text-xs text-red-500 font-medium mt-1 block animate-in slide-in-from-top-1">
          {errors[name]?.message?.toString()}
        </span>
      )}
    </div>
  );

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="flex flex-col h-full bg-white relative"
    >
      {/* HEADER SECTION */}
      <div className="p-6 pb-8 bg-gradient-to-br from-blue-50 to-white border-b border-gray-100">
        <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Megaphone size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-800">
            {type === "create" ? "New Announcement" : "Edit Announcement"}
            </h1>
        </div>
        <p className="text-xs text-gray-500 pl-[52px]">
          Notify players, parents, or coaches about upcoming events.
        </p>
      </div>

      {/* FORM BODY */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        
        <ModernInput 
            label="Announcement Title" 
            name="title" 
            icon={Type} 
            placeholder="e.g. Practice Cancelled (Heavy Rain)" 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ModernInput 
            label="Target Audience" 
            name="audience" 
            type="select"
            icon={Users} 
            options={["All", "Coaches", "Players", "Parents", "U14 Team", "U16 Team"]}
          />

          <ModernInput 
            label="Publish Date" 
            name="date" 
            type="date" 
            icon={Calendar} 
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
            <div className="mt-0.5 text-blue-500"><Megaphone size={16} /></div>
            <div>
                <h4 className="text-xs font-bold text-blue-800 mb-1">Quick Tip</h4>
                <p className="text-xs text-blue-600 leading-relaxed">
                    Announcements sent to "All" will appear on every dashboard. Use specific groups to keep notifications relevant.
                </p>
            </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center rounded-b-2xl">
        
        {type === "update" ? (
            <button 
                type="button" 
                onClick={handleDelete}
                disabled={isDeleting || loading}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
            >
                {isDeleting ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 size={16} />} 
                Delete
            </button>
        ) : (
            <div></div> 
        )}

        <div className="flex gap-3">
            <button 
                type="button" 
                onClick={() => window.location.reload()} 
                className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
            >
                Cancel
            </button>
            
            <button 
                type="submit" 
                disabled={loading || isDeleting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl shadow-lg shadow-gray-900/10 active:scale-95 transition-all flex items-center gap-2"
            >
                {loading && <Loader2 className="animate-spin w-4 h-4" />}
                {type === "create" ? "Publish Now" : "Save Changes"}
            </button>
        </div>
      </div>
    </form>
  );
};

export default AnnouncementForm;