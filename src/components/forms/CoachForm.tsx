"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createCoach, updateCoach, getAllTeams } from "@/lib/actions"; // ✅ Import getAllTeams
import { CldUploadWidget } from 'next-cloudinary';
import {
  User,
  Mail,
  Phone,
  Lock,
  Briefcase,
  Users,
  BadgeCheck,
  CloudUpload,
  Shield,
  Loader2
} from "lucide-react";
import Image from "next/image";

// --- SCHEMA ---
const schema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().optional(),
  name: z.string().min(1),
  phone: z.string().min(10),
  role: z.string().min(1),
  specialties: z.string().min(1),
  teams: z.string().min(1, { message: "Please select a team" }), // ✅ Required
  img: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const CoachForm = ({ type, data }: { type: "create" | "update"; data?: any }) => {
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState<string>("");
  const [teamsList, setTeamsList] = useState<{ id: string; name: string }[]>([]); // ✅ State for Teams
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...data,
      // If updating, handle the pre-selected values
      specialties: data?.specialties?.join(", "),
      teams: data?.teams?.[0] || "", // Assuming single team select for simplicity
      img: data?.img || "",
    },
  });

  // ✅ FETCH TEAMS ON MOUNT
  useEffect(() => {
    const fetchTeams = async () => {
      const teams = await getAllTeams();
      setTeamsList(teams);
    };
    fetchTeams();

    if (data?.img) setImgUrl(data.img);
  }, [data]);

  const onSubmit = async (formData: Inputs) => {
    setLoading(true);

    const finalData = {
      ...formData,
      id: data?.id,
      specialties: formData.specialties.split(",").map((s) => s.trim()),
      teams: [formData.teams], // Convert single select to array expected by backend logic
      img: imgUrl,
    };

    console.log("Submitting:", finalData);

    try {
      const action = type === "create" ? createCoach : updateCoach;
      const result = await action(finalData);

      if (result.success) {
        alert(result.message);
        router.refresh();
        window.location.reload();
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // Modern Input Helper
  const ModernInput = ({ label, name, icon: Icon, type = "text", placeholder }: any) => (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="relative group">
        {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={18} /></div>}
        <input
          type={type}
          {...register(name)}
          placeholder={placeholder}
          className={`w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2.5 outline-none ${Icon ? "pl-10" : ""}`}
        />
      </div>
      {/* {errors[name]?.message && <span className="text-xs text-red-500">{errors[name]?.message?.toString()}</span>} */}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">

      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-800">{type === "create" ? "Add Coach" : "Edit Profile"}</h1>
        <p className="text-sm text-gray-500">{type === "create" ? "Onboard a new coach." : "Update details."}</p>
      </div>

      {/* CREDENTIALS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-blue-100 rounded-md text-blue-600"><Shield size={16} /></div>
          <h2 className="text-sm font-bold text-gray-700">Account Credentials</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ModernInput label="Coach ID" name="username" icon={User} placeholder="coach_john" />
          <ModernInput label="Email Address" name="email" icon={Mail} type="email" placeholder="john@dcway.com" />
          <ModernInput label="Password" name="password" icon={Lock} type="password" placeholder="Min 8 chars" />
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Briefcase size={18} /></div>
              <select {...register("role")} className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2.5 pl-10 outline-none">
                <option value="COACH">Head Coach</option>
                <option value="ASSISTANT">Assistant Coach</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* PERSONAL */}
      <div className="space-y-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2 pt-2">
          <div className="p-1.5 bg-purple-100 rounded-md text-purple-600"><User size={16} /></div>
          <h2 className="text-sm font-bold text-gray-700">Personal Details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ModernInput label="Full Name" name="name" icon={User} placeholder="John Doe" />
          <ModernInput label="Phone Number" name="phone" icon={Phone} placeholder="+1 555 000 0000" />
        </div>
      </div>

      {/* PROFESSIONAL & UPLOAD */}
      <div className="space-y-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2 pt-2">
          <div className="p-1.5 bg-green-100 rounded-md text-green-600"><BadgeCheck size={16} /></div>
          <h2 className="text-sm font-bold text-gray-700">Expertise & Team</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ModernInput label="Specialties (comma separated)" name="specialties" icon={BadgeCheck} placeholder="Tactical, Technical..." />

          {/* ✅ DYNAMIC TEAM SELECTOR */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned Team</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Users size={18} /></div>
              <select
                {...register("teams")}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2.5 pl-10 outline-none"
              >
                <option value="">Select a Team...</option>
                {teamsList.map((team) => (
                  <option key={team.id} value={team.id}>  
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.teams && <span className="text-xs text-red-500">{errors.teams.message?.toString()}</span>}
          </div>
        </div>

        {/* IMAGE UPLOAD */}
        <div className="w-full mt-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Profile Photo</label>
          <CldUploadWidget
            uploadPreset="Football"
            onSuccess={(result: any) => {
              const url = result?.info?.secure_url;
              if (url) {
                setImgUrl(url);
                setValue("img", url);
              }
            }}
          >
            {({ open }) => (
              <div onClick={() => open()} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative overflow-hidden">
                {imgUrl ? (
                  <Image src={imgUrl} alt="Preview" fill className="object-cover rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center pt-5 pb-6">
                    <CloudUpload className="w-8 h-8 text-gray-400" />
                    <p className="text-xs text-gray-500">Click to upload</p>
                  </div>
                )}
              </div>
            )}
          </CldUploadWidget>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button type="button" onClick={() => window.location.reload()} className="hidden md:block px-5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-100">Cancel</button>
        <button type="submit" disabled={loading} className="w-full md:w-auto px-6 py-2.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          {loading && <Loader2 className="animate-spin w-4 h-4" />} {type === "create" ? "Create Coach" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default CoachForm;