"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createDrill, updateDrill, getMasterDrillList, getTemplateDetails } from "@/lib/actions"; // ✅ Added imports
import {
  Hash,
  Type,
  Layers,
  Users,
  Video,
  TrendingDown,
  TrendingUp,
  List,
  Loader2,
  BookOpen // Icon for template
} from "lucide-react";

// --- SCHEMA ---
const schema = z.object({
  code: z.string().min(3, { message: "Code must be at least 3 chars" }),
  name: z.string().min(3, { message: "Drill name is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  level: z.enum(["Beginner", "Intermediate", "Advanced"], { message: "Level is required" }),
  primarySkills: z.string().min(1, { message: "At least one skill required" }),
  minAge: z.string().min(1, { message: "Min age required" }),
  maxAge: z.string().min(1, { message: "Max age required" }),
  description: z.string().min(10, { message: "Description is too short" }),
  regressionTip: z.string().optional(),
  progressionTip: z.string().optional(),
  videoUrl: z.string().optional().or(z.literal("")),
});

type Inputs = z.infer<typeof schema>;

const DrillForm = ({ type, data }: { type: "create" | "update"; data?: any }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ✅ State for Templates
  const [templates, setTemplates] = useState<{ id: string, name: string, category: string }[]>([]);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const {
    register,
    handleSubmit,
    setValue, // Used to auto-fill form
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...data,
      // Convert Array to String for the input field if editing existing data
      primarySkills: Array.isArray(data?.primarySkills)
        ? data.primarySkills.join(", ")
        : data?.primarySkills || "",
      minAge: data?.minAge?.toString(),
      maxAge: data?.maxAge?.toString(),
    },
  });

  // ✅ 1. FETCH TEMPLATES ON MOUNT
  useEffect(() => {
    if (type === "create") {
      const fetchTemplates = async () => {
        const list = await getMasterDrillList();
        setTemplates(list);
      };
      fetchTemplates();
    }
  }, [type]);

  // ✅ 2. HANDLE TEMPLATE SELECTION (Auto-Fill)
  const handleTemplateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const drillId = e.target.value;
    if (!drillId) return;

    setLoadingTemplate(true);
    try {
      const drill = await getTemplateDetails(drillId);
      if (drill) {
        // 🪄 MAGIC: Fill all form fields instantly
        setValue("code", drill.id);
        setValue("name", drill.name);
        setValue("category", drill.category);
        setValue("level", drill.level as "Beginner" | "Intermediate" | "Advanced");
        setValue("primarySkills", drill.primarySkills.join(", ")); // Convert array to string
        setValue("minAge", drill.minAge.toString());
        setValue("maxAge", drill.maxAge.toString());
        setValue("description", drill.description);
        setValue("regressionTip", drill.regressionTip || "");
        setValue("progressionTip", drill.progressionTip || "");
        setValue("videoUrl", drill.videoUrl || "");
      }
    } catch (err) {
      console.error("Error loading template", err);
    } finally {
      setLoadingTemplate(false);
    }
  };

  const onSubmit = async (formData: Inputs) => {
    setLoading(true);

    // Prepare data
    const finalData = {
      ...formData,
      id: data?.id, // Needed for update
    };

    try {
      const action = type === "create" ? createDrill : updateDrill;
      const result = await action(finalData);

      if (result.success) {
        alert(result.message);
        router.refresh();
        window.location.reload();
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // --- MODERN INPUT COMPONENT ---
  const ModernInput = ({ label, name, icon: Icon, type = "text", placeholder, isTextarea = false }: { label: string; name: keyof Inputs; icon?: any; type?: string; placeholder?: string; isTextarea?: boolean }) => (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="relative group">
        {Icon && !isTextarea && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}

        {isTextarea ? (
          <textarea
            {...register(name)}
            rows={3}
            placeholder={placeholder}
            className={`w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2.5 outline-none ${errors[name] ? "border-red-400 bg-red-50" : ""}`}
          />
        ) : (
          <input
            type={type}
            {...register(name)}
            placeholder={placeholder}
            className={`w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2.5 outline-none ${Icon ? "pl-10" : ""
              } ${errors[name] ? "border-red-400 bg-red-50" : ""}`}
          />
        )}
      </div>
      {/* {errors[name]?.message && (
        <span className="text-xs text-red-500">{errors[name]?.message?.toString()}</span>
      )} */}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-8 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar"
    >
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-800">
          {type === "create" ? "Create Drill" : "Edit Drill"}
        </h1>
        <p className="text-sm text-gray-500">
          {type === "create" ? "Add a new exercise or load from template." : "Update drill details."}
        </p>
      </div>

      {/* 🔥 NEW: TEMPLATE SELECTOR (Only in Create Mode) */}
      {type === "create" && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-2 text-blue-800">
            <BookOpen size={18} />
            <h3 className="text-sm font-bold">Fast Load (Optional)</h3>
          </div>
          <p className="text-xs text-blue-600 mb-3">Select a drill from the master library to auto-fill details.</p>
          <div className="relative">
            <select
              onChange={handleTemplateChange}
              className="w-full bg-white border border-blue-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block p-2.5 outline-none cursor-pointer"
            >
              <option value="">-- Select a Master Drill --</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
            {loadingTemplate && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="animate-spin w-4 h-4 text-blue-500" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SECTION 1: IDENTITY --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ModernInput label="Drill Code" name="code" icon={Hash} placeholder="TEC_006" />
        <div className="flex flex-col w-full">
          <ModernInput label="Drill Name" name="name" icon={Type} placeholder="V-Cut (Inside)" />
          {/* Trigger diagram for common drill names if detected, or generic drill setup */}
          <span className="text-[10px] text-gray-400 mt-1">
            Example:
          </span>
        </div>
      </div>

      {/* --- SECTION 2: CLASSIFICATION --- */}
      <div className="space-y-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2 pt-2">
          <div className="p-1.5 bg-purple-100 rounded-md text-purple-600"><Layers size={16} /></div>
          <h2 className="text-sm font-bold text-gray-700">Classification</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
            <select {...register("category")} className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg block p-2.5 outline-none">
              <option value="">Select...</option>
              <option value="Technical">Technical</option>
              <option value="Tactical">Tactical</option>
              <option value="Physical">Physical</option>
              <option value="Mental">Mental</option>
              <option value="Cognitive">Cognitive</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Level</label>
            <select {...register("level")} className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg block p-2.5 outline-none">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- SECTION 3: SPECS & DESCRIPTION --- */}
      <div className="space-y-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2 pt-2">
          <div className="p-1.5 bg-green-100 rounded-md text-green-600"><List size={16} /></div>
          <h2 className="text-sm font-bold text-gray-700">Details & Content</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ModernInput label="Primary Skills (Comma Separated)" name="primarySkills" icon={Layers} placeholder="Dribbling, Control..." />
          <div className="flex gap-4">
            <ModernInput label="Min Age" name="minAge" type="number" icon={Users} placeholder="5" />
            <ModernInput label="Max Age" name="maxAge" type="number" icon={Users} placeholder="99" />
          </div>
        </div>

        <div className="w-full">
          <ModernInput label="Drill Description" name="description" isTextarea placeholder="Explain the drill mechanics..." />
        </div>
      </div>

      {/* --- SECTION 4: COACHING POINTS --- */}
      <div className="space-y-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2 pt-2">
          <div className="p-1.5 bg-orange-100 rounded-md text-orange-600"><TrendingUp size={16} /></div>
          <h2 className="text-sm font-bold text-gray-700">Coaching Points</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ModernInput label="Regression (Easier)" name="regressionTip" icon={TrendingDown} placeholder="Perform at 50% speed..." />
          <ModernInput label="Progression (Harder)" name="progressionTip" icon={TrendingUp} placeholder="Add defender..." />
        </div>

        <div className="w-full">
          <ModernInput label="Video URL" name="videoUrl" icon={Video} placeholder="https://youtube.com/..." />
        </div>
      </div>

      {/* --- FOOTER ACTIONS --- */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button type="button" onClick={() => window.location.reload()} className="hidden md:block px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100">
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          {type === "create" ? "Create Drill" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default DrillForm;