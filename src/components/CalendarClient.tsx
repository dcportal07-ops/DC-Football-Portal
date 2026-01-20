"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { X, Trash2, Plus, Undo } from "lucide-react";
import { createEvent, updateEvent, deleteEvent } from "@/lib/calendarActions"; // Ensure this path is correct

// --- TYPES ---
type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  teamId: string;
};

type CalendarClientProps = {
  initialEvents: {
    id: string;
    title: string;
    start: string | Date;
    end: string | Date;
    teamId: string;
  }[];
  userRole: string; // ✅ Yeh Prop zaroori hai
};

type UndoState = {
  event: Event;
  timeoutId: NodeJS.Timeout;
} | null;

// --- COLOR LOGIC ---
const getEventStyle = (title: string, index: number) => {
  const t = title.toLowerCase();
  if (t.includes("match")) return "bg-orange-50 border-orange-300 text-orange-800";
  if (t.includes("training") || t.includes("drills")) return "bg-blue-50 border-blue-300 text-blue-800";
  if (t.includes("evaluation")) return "bg-purple-50 border-purple-300 text-purple-800";

  const colors = [
    "bg-green-50 border-green-300 text-green-800",
    "bg-pink-50 border-pink-300 text-pink-800",
    "bg-yellow-50 border-yellow-300 text-yellow-800",
    "bg-indigo-50 border-indigo-300 text-indigo-800",
  ];
  return colors[index % colors.length];
};

const CalendarClient = ({ initialEvents, userRole }: CalendarClientProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // ✅ SAFE ROLE CHECK (Case Insensitive)
  const canEdit = useMemo(() => {
    const r = userRole?.toLowerCase() || "";
    return r === "admin" || r === "coach";
  }, [userRole]);

  // --- STATE INITIALIZATION ---
  const [events, setEvents] = useState<Event[]>(() => {
    return initialEvents.map((evt) => ({
      ...evt,
      start: new Date(evt.start),
      end: new Date(evt.end),
    }));
  });

  useEffect(() => {
    setEvents(
      initialEvents.map((evt) => ({
        ...evt,
        start: new Date(evt.start),
        end: new Date(evt.end),
      }))
    );
  }, [initialEvents]);

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({ title: "", startTime: "10:00", endTime: "11:00" });
  const [undoState, setUndoState] = useState<UndoState>(null);

  // --- DATE CALCULATIONS ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // --- GROUP EVENTS ---
  const eventsByDay = useMemo(() => {
    const map: Record<string, Event[]> = {};
    events.forEach((evt) => {
      const key = evt.start.toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(evt);
    });
    return map;
  }, [events]);

  // --- NAVIGATION ---
  const goPrevMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  // --- HANDLERS ---
  const openCreate = (day: number) => {
    if (!canEdit) return; // Guard
    const date = new Date(year, month, day);
    setSelectedDate(date);
    setFormData({ title: "", startTime: "10:00", endTime: "11:00" });
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEdit = (e: React.MouseEvent, evt: Event) => {
    if (!canEdit) return; // Guard
    e.stopPropagation();
    setSelectedEvent(evt);
    setFormData({
      title: evt.title,
      startTime: evt.start.toTimeString().slice(0, 5),
      endTime: evt.end.toTimeString().slice(0, 5),
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate && !selectedEvent) return;

    const baseDate = modalMode === "create" ? selectedDate! : selectedEvent!.start;
    
    // Parse times
    const [sh, sm] = formData.startTime.split(":").map(Number);
    const [eh, em] = formData.endTime.split(":").map(Number);

    const start = new Date(baseDate);
    start.setHours(sh, sm);
    const end = new Date(baseDate);
    end.setHours(eh, em);

    // OPTIMISTIC UPDATE
    if (modalMode === "create") {
      const newEvent: Event = {
        id: Math.random().toString(), // Temp ID
        title: formData.title,
        start,
        end,
        teamId: "", // Add default or pass from props
      };
      setEvents((prev) => [...prev, newEvent]);
      // SERVER ACTION
      await createEvent({ title: formData.title, start, end, teamId: "" });
    } else if (modalMode === "edit" && selectedEvent) {
      setEvents((prev) =>
        prev.map((evt) =>
          evt.id === selectedEvent.id ? { ...evt, title: formData.title, start, end } : evt
        )
      );
      // SERVER ACTION
      await updateEvent(selectedEvent.id, { title: formData.title, start, end });
    }

    closeModal();
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    const deleted = selectedEvent;
    
    // OPTIMISTIC UPDATE
    setEvents((prev) => prev.filter((e) => e.id !== deleted.id));

    // Undo Logic (Local only for 5s)
    const timeoutId = setTimeout(() => setUndoState(null), 5000);
    setUndoState({ event: deleted, timeoutId });

    // SERVER ACTION
    await deleteEvent(deleted.id);

    closeModal();
  };

  const undoDelete = () => {
    if (!undoState) return;
    clearTimeout(undoState.timeoutId);
    setEvents((prev) => [...prev, undoState.event]);
    // Note: Re-creating via server action on undo is complex, 
    // usually we would delay the delete call. For simplicity, 
    // assume delete is instant and user has to recreate if undo (or use complex optimistic logic).
    // Better UX: Just re-create it.
    createEvent({ title: undoState.event.title, start: undoState.event.start, end: undoState.event.end, teamId: undoState.event.teamId });
    setUndoState(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  return (
    <div className="bg-white p-4 rounded-md m-4 relative h-full flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Calendar</h1>
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border">
          <Button variant="ghost" size="sm" onClick={goPrevMonth}>«</Button>
          <span className="font-semibold w-36 text-center select-none">
            {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </span>
          <Button variant="ghost" size="sm" onClick={goNextMonth}>»</Button>
        </div>
        
        {/* ✅ ADD BUTTON - ONLY FOR ADMIN/COACH */}
        {canEdit && (
          <Button onClick={() => openCreate(new Date().getDate())} className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-teal-600 hover:bg-teal-700">
            <Plus size={20} />
          </Button>
        )}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-gray-400 text-xs font-semibold py-2 uppercase">
            {d}
          </div>
        ))}

        {[...Array(firstDayOfMonth)].map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-50/30 rounded-md" />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dateStr = new Date(year, month, day).toDateString();
          const dayEvents = eventsByDay[dateStr] || [];

          return (
            <div
              key={day}
              onClick={() => openCreate(day)}
              className={`border rounded-md p-2 min-h-[100px] relative overflow-hidden transition-colors ${canEdit ? "cursor-pointer hover:bg-gray-50" : ""}`}
            >
              <div className="text-xs font-semibold mb-1 text-gray-500">{day}</div>
              <div className="flex flex-col gap-1">
                {dayEvents.map((evt, idx) => (
                  <div
                    key={evt.id}
                    onClick={(e) => openEdit(e, evt)}
                    className={`text-[10px] px-2 py-1 rounded border truncate font-medium cursor-pointer hover:opacity-80 ${getEventStyle(evt.title, idx)}`}
                    title={evt.title}
                  >
                    {evt.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-sm shadow-xl relative">
            <Button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" variant="ghost" size="sm">
              <X size={18} />
            </Button>
            <h2 className="text-lg font-bold mb-4">{modalMode === "create" ? "Add Event" : "Edit Event"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                className="border p-2 rounded-md text-sm w-full"
                placeholder="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                autoFocus
                required
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Start</label>
                  <input
                  placeholder="start"
                    type="time"
                    className="border p-2 rounded-md text-sm w-full"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">End</label>
                  <input
                  placeholder="end"
                    type="time"
                    className="border p-2 rounded-md text-sm w-full"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                {modalMode === "edit" && (
                  <Button type="button" onClick={handleDelete} variant="destructive" className="flex-1">
                    <Trash2 size={16} className="mr-2"/> Delete
                  </Button>
                )}
                <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700">
                  {modalMode === "create" ? "Create" : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UNDO TOAST */}
      {undoState && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-md flex items-center gap-3 shadow-lg z-50 animate-in slide-in-from-bottom-5">
          <span>Event deleted</span>
          <Button onClick={undoDelete} className="underline flex items-center gap-1 text-white hover:text-teal-400" variant="link">
            <Undo size={14} /> Undo
          </Button>
        </div>
      )}
    </div>
  );
};

export default CalendarClient;