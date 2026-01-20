"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateCurrentProfile } from "@/lib/actions"; // The action we created in step 3A
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Assuming Shadcn Dialog
import { Button } from "@/components/ui/button";
import { Edit, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const ProfileEditForm = ({ data, role }: { data: any; role: string }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      phone: data.user.phone || "",
      address: data.address || "", // Only for players
      parentEmail: data.parentEmail || "", // Only for players
    },
  });

  const onSubmit = async (formData: any) => {
    setLoading(true);
    const res = await updateCurrentProfile(formData);
    setLoading(false);
    if (res.success) {
      setOpen(false);
      router.refresh();
    } else {
      alert("Error updating profile");
    }
  };

  // Only allow Players to edit detailed fields for now
  if (role !== "player") return null; 

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Edit size={16} /> Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
           {/* Phone */}
           <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
              <input {...register("phone")} className="border p-2 rounded-md" />
           </div>

           {/* Address (Player Only) */}
           <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Address</label>
              <input {...register("address")} className="border p-2 rounded-md" />
           </div>

           {/* Parent Email (Player Only) */}
           <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Parent Email</label>
              <input {...register("parentEmail")} className="border p-2 rounded-md" />
           </div>

           <Button type="submit" disabled={loading} className="w-full bg-blue-600 text-white">
              {loading ? <Loader2 className="animate-spin" /> : "Save Changes"}
           </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditForm;