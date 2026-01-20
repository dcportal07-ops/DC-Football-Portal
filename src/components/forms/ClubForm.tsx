"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import Image from "next/image";
import { createClub, updateClub } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CloudUpload, X, Loader2 } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary"; 

// Schema matching Server Action
const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "Club name is required (min 3)" }),
  code: z.string().min(2, { message: "Code is required" }),
  logo: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const ClubForm = ({ type, data, setOpen }: { type: "create" | "update"; data?: any; setOpen?: (val: boolean) => void }) => {
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: data?.id,
      name: data?.name,
      code: data?.code,
      logo: data?.logo || "",
    },
  });

  const [img, setImg] = useState<string | null>(data?.logo || null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle Form Submission
  const onSubmit = handleSubmit(async (formData) => {
    setLoading(true);
    const action = type === "create" ? createClub : updateClub;
    
    // Pass initial state + data
    const res = await action(
        { success: false, error: false, message: "" }, 
        { ...formData, logo: img || undefined }
    );

    if (res.success) {
      toast.success(res.message);
      setOpen && setOpen(false);
      router.refresh();
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold text-gray-900">
        {type === "create" ? "Create New Club" : "Edit Club Details"}
      </h1>

      <div className="flex flex-col gap-6">
        
        {/* --- 1. PHOTO UPLOAD SECTION --- */}
        <div className="w-full flex flex-col gap-2">
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Club Logo</label>
            
            <CldUploadWidget
                uploadPreset="school_management" // ⚠️ Ensure this matches your Cloudinary Settings
                onSuccess={(result, { widget }) => {
                    // @ts-ignore
                    const url = result?.info?.secure_url;
                    if(url) {
                        setImg(url);
                        setValue("logo", url);
                        widget.close();
                    }
                }}
            >
                {({ open }) => {
                    return (
                        <div 
                            onClick={() => open()}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors h-[100px] group"
                        >
                            {img ? (
                                // Show Preview if Image Exists
                                <div className="relative w-16 h-16 shadow-md rounded-full">
                                    <Image 
                                      src={img} 
                                      alt="Logo" 
                                      fill 
                                      className="object-cover rounded-full border border-gray-200" 
                                    />
                                </div>
                            ) : (
                                // Show Upload Placeholder
                                <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                    <CloudUpload size={28} />
                                </div>
                            )}
                            
                            {/* Text Info */}
                            <div className="flex flex-col text-left">
                                <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600">
                                    {img ? "Change Logo" : "Click to Upload"}
                                </span>
                                <span className="text-xs text-gray-400">SVG, PNG, JPG (Max 2MB)</span>
                            </div>
                        </div>
                    );
                }}
            </CldUploadWidget>
            
            {/* Hidden Input as Fallback */}
            <input type="hidden" {...register("logo")} value={img || ""} />
        </div>

        {/* --- 2. TEXT INPUTS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Club Name */}
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500 font-medium uppercase">Club Name</label>
                <input
                type="text"
                {...register("name")}
                className="ring-[1.5px] ring-gray-300 p-2.5 rounded-md text-sm w-full outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                placeholder="e.g. Manchester City"
                />
                {errors.name?.message && (
                <p className="text-xs text-red-500 font-medium">{errors.name.message.toString()}</p>
                )}
            </div>

            {/* Club Code */}
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500 font-medium uppercase">Short Code</label>
                <input
                type="text"
                {...register("code")}
                className="ring-[1.5px] ring-gray-300 p-2.5 rounded-md text-sm w-full outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                placeholder="e.g. MCI"
                />
                {errors.code?.message && (
                <p className="text-xs text-red-500 font-medium">{errors.code.message.toString()}</p>
                )}
            </div>
        </div>

      </div>

      {/* --- SUBMIT BUTTON --- */}
      <button 
        disabled={loading}
        className="bg-blue-600 text-white p-3 rounded-md font-bold hover:bg-blue-500 transition-colors shadow-md flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="animate-spin" size={18} />}
        {type === "create" ? "Create Club" : "Update Club"}
      </button>
    </form>
  );
};

export default ClubForm;