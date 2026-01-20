"use client";

import React,{useState } from "react";
import { Button } from "./ui/button";
import { Plus, Trash2, Pencil, X, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

/* ================= SERVER ACTIONS ================= */
import {
  deleteCoach,
  deletePlayer,
  deleteTeam,
  deleteDrill,
  deleteAnnouncement,
  deleteAssignment,
  deleteClub, // 🔥 ADDED THIS
} from "@/lib/actions";

/* ================= DYNAMIC FORMS ================= */
const CoachForm = dynamic(() => import("./forms/CoachForm"), {
  loading: () => <p className="p-4">Loading Coach Form...</p>,
});
const PlayerForm = dynamic(() => import("./forms/PlayerForm"), {
  loading: () => <p className="p-4">Loading Player Form...</p>,
});
const TeamForm = dynamic(() => import("./forms/TeamForm"), {
  loading: () => <p className="p-4">Loading Team Form...</p>,
});
const DrillForm = dynamic(() => import("./forms/DrillForm"), {
  loading: () => <p className="p-4">Loading Drill Form...</p>,
});
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
  loading: () => <p className="p-4">Loading Announcement Form...</p>,
});
const EvaluationForm = dynamic(() => import("./forms/EvaluationForm"), {
  loading: () => <p className="p-4">Loading Evaluation Form...</p>,
});
const HomeworkForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => <p className="p-4">Loading Homework Form...</p>,
});
const ClubForm = dynamic(() => import("./forms/ClubForm"), { 
  loading: () => <div className="p-4 text-center">Loading Club Form...</div> 
});

/* ================= FORM REGISTRY ================= */
const forms: Record<
  string,
  (type: "create" | "update", data?: any) => JSX.Element
> = {
  coaches: (type, data) => <CoachForm type={type} data={data} />,
  players: (type, data) => <PlayerForm type={type} data={data} />,
  teams: (type, data) => <TeamForm type={type} data={data} />,
  drills: (type, data) => <DrillForm type={type} data={data} />,
  announcements: (type, data) => <AnnouncementForm type={type} data={data} />,
  evaluations: (type, data) => <EvaluationForm type={type} data={data} />,
  homework: (type, data) => <HomeworkForm type={type} data={data} />,
  clubs: (type, data) => <ClubForm type={type} data={data} />, // 🔥 CLUB FORM LINKED
};

/* ================= TYPES ================= */
type TableName =
  | "coaches"
  | "players"
  | "teams"
  | "drills"
  | "announcements"
  | "evaluations"
  | "homework"
  | "clubs"; // 🔥 FIXED SYNTAX

type ActionType = "create" | "update" | "delete";

/* ================= COMPONENT ================= */
const FormModal = ({
  table,
  type,
  data,
  id,
}: {
  table: TableName;
  type: ActionType;
  data?: any;
  id?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /* ================= ICON & STYLE ================= */
  const size = type === "create" ? "w-9 h-9" : "w-8 h-8";
  const bgColor =
    type === "create"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-transparent hover:bg-gray-100";

  const renderIcon = () => {
    if (type === "create") return <Plus size={16} />;
    if (type === "update") return <Pencil size={15} className="text-gray-600" />;
    if (type === "delete") return <Trash2 size={15} className="text-red-600" />;
    return null;
  };

/* ================= DELETE HANDLER ================= */
  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    try {
      // Existing delete logic for simple actions
      if (table === "coaches") await deleteCoach(id);
      if (table === "players") await deletePlayer(id);
      if (table === "teams") await deleteTeam(id);
      if (table === "drills") await deleteDrill(id);
      if (table === "announcements") await deleteAnnouncement(id);
      if (table === "homework") await deleteAssignment(id);

      // 🔥 FIX FOR CLUBS: Wrap the ID in FormData
      if (table === "clubs") {
          const formData = new FormData();
          formData.append("id", id);
          // We pass a dummy state as the first arg, and formData as the second
          await deleteClub({ success: false, error: false, message: "" }, formData);
      }

      setOpen(false);
      router.refresh();
      // Optional: toast.success("Deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  /* ================= MODAL CONTENT ================= */
  const ModalContent = () => {
    // DELETE
    if (type === "delete" && id) {
      return (
        <form
          onSubmit={handleDelete}
          className="flex flex-col gap-6 text-center p-4"
        >
          <h2 className="text-lg font-bold text-gray-800">
            Delete {table.slice(0, -1)}?
          </h2>
          <p className="text-sm text-gray-500">
            This action cannot be undone.
          </p>

          <div className="flex justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white flex gap-2"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </Button>
          </div>
        </form>
      );
    }

    // CREATE / UPDATE
    if (type === "create" || type === "update") {
      // Pass setOpen to forms so they can close the modal on success
      return forms[table]
        ? React.cloneElement(forms[table](type, data), { setOpen } as any)
        : <p className="p-4">Form not found</p>;
    }

    return null;
  };

  /* ================= RENDER ================= */
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={`${size} rounded-full p-0 flex items-center justify-center ${bgColor}`}
      >
        {renderIcon()}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* CLOSE */}
            <Button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={18} />
            </Button>

            <ModalContent />
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;