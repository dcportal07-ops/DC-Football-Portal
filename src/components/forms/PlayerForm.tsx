"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from 'next-cloudinary';
import { createPlayer, updatePlayer, getAllTeams } from "@/lib/actions";
import {
  User,
  Mail,
  Lock,
  MapPin,
  Calendar,
  Hash,
  Shield,
  CloudUpload,
  Smile,
  BadgeCheck,
  Loader2
} from "lucide-react";
import Image from "next/image";

// --- SCHEMA ---
const schema = z.object({
  // ✅ Changed 'playerId' to 'username' to match DB data
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  parentEmail: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(), // ✅ Added Phone
  password: z.string().optional(),

  // ✅ Combined First/Last Name into single 'name'
  name: z.string().min(1, { message: "Full name is required" }),

  dob: z.string().min(1, { message: "Date of Birth is required" }),
  gender: z.enum(["M", "F", "Other"], { message: "Gender is required" }),
  address: z.string().min(5, { message: "Address is too short" }),
  teamId: z.string().optional(),
  jerseyNumber: z.any(),
  img: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const PlayerForm = ({
  type,
  data,
}: {
  type: "create" | "update";
  data?: any;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState<string>(data?.img || "");
  const [teamsList, setTeamsList] = useState<{ id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: data?.username, // ✅ Maps correctly now
      parentEmail: data?.parentEmail || data?.email, // Handle both cases
      name: data?.name, // ✅ Maps Full Name
      phone: data?.phone || "", // ✅ Added Phone
      address: data?.address,
      gender: data?.gender,
      dob: data?.dob ? new Date(data.dob).toISOString().split('T')[0] : "",
      jerseyNumber: data?.jerseyNumber || "",
      teamId: data?.teamId || "",
    },
  });

  // 1. FETCH TEAMS ON LOAD
  useEffect(() => {
    const fetchTeams = async () => {
      const teams = await getAllTeams();
      setTeamsList(teams);
    };
    fetchTeams();
  }, []);

  // 2. HANDLE SUBMIT
  const onSubmit = async (formData: Inputs) => {
    setLoading(true);

    // Prepare Data
    const finalData = {
      ...formData,
      id: data?.id,
      userId: data?.userId,
      img: imgUrl,
      teamId: formData.teamId === "" ? undefined : formData.teamId,
    };

    try {
      const action = type === "create" ? createPlayer : updatePlayer;
      const result = await action(finalData);

      if (result.success) {
        // alert(result.message); // Optional: Use toast if preferred
        router.refresh();
        // Close modal logic usually happens here via props, 
        // but since we are reloading to force update:
        window.location.reload();
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // --- MODERN INPUT COMPONENT (UI Unchanged) ---
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
          className={`w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2.5 outline-none ${Icon ? "pl-10" : ""
            } ${errors[name as keyof Inputs] ? "border-red-400 bg-red-50" : ""}`}
        />
      </div>
      {errors[name as keyof Inputs]?.message && (
        <span className="text-xs text-red-500">{errors[name as keyof Inputs]?.message?.toString()}</span>
      )}
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
          {type === "create" ? "Register Player" : "Edit Player"}
        </h1>
        <p className="text-sm text-gray-500">
          {type === "create" ? "Create a new player profile." : "Update player details."}
        </p>
      </div>

      {/* --- SECTION 1: ACCOUNT --- */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-blue-100 rounded-md text-blue-600"><Shield size={16} /></div>
          <h2 className="text-sm font-bold text-gray-700">Login Credentials</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ✅ Changed name="playerId" to name="username" */}
          <ModernInput label="Player ID (Username)" name="username" icon={User} placeholder="player_leo_001" />
          <ModernInput label="Parent Email" name="parentEmail" icon={Mail} type="email" placeholder="parent@family.com" />
          <ModernInput label="Phone" name="phone" icon={User} placeholder="+1 234 567 8900" /> {/* ✅ Added Phone Input */}
          <ModernInput label="Password" name="password" icon={Lock} type="password" placeholder="Min 8 chars" />
        </div>
      </div>

      {/* --- SECTION 2: PERSONAL INFO --- */}
      <div className="space-y-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2 pt-2">
          <div className="p-1.5 bg-purple-100 rounded-md text-purple-600"><User size={16} /></div>
          <h2 className="text-sm font-bold text-gray-700">Personal Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ✅ Combined Name Input */}
          <ModernInput label="Full Name" name="name" icon={User} placeholder="Leo Anderson" />

          <ModernInput label="Date of Birth" name="dob" icon={Calendar} type="date" />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Smile size={18} /></div>
              <select {...register("gender")} className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2.5 pl-10 outline-none">
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <ModernInput label="Home Address" name="address" icon={MapPin} placeholder="123 Main St, Springfield, USA" />
          </div>
        </div>
      </div>

      {/* --- SECTION 3: SPORT DETAILS --- */}
      <div className="space-y-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2 pt-2">
          <div className="p-1.5 bg-green-100 rounded-md text-green-600"><BadgeCheck size={16} /></div>
          <h2 className="text-sm font-bold text-gray-700">Sport Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Team Dropdown */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned Team</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Shield size={18} /></div>
              <select
                {...register("teamId")}
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
          </div>

          <ModernInput label="Jersey Number" name="jerseyNumber" type="number" icon={Hash} placeholder="17" />
        </div>

        {/* CLOUDINARY UPLOAD */}
        <div className="w-full mt-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Player Photo</label>
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
              <div onClick={() => open()} className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group relative overflow-hidden">
                {imgUrl ? (
                  <Image src={imgUrl} alt="Preview" fill className="object-cover rounded-lg opacity-80" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <CloudUpload className="w-8 h-8 mb-2 text-gray-400 group-hover:text-blue-500" />
                    <p className="text-xs text-gray-500">Click to upload</p>
                  </div>
                )}
              </div>
            )}
          </CldUploadWidget>
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
          {type === "create" ? "Create Player" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default PlayerForm;