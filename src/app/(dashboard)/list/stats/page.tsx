// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import { Button } from "@/components/ui/button";
// import { X, Trash2, Check, Plus, Undo } from "lucide-react";

// /* ================= ROLE CONTROL ================= */
// const role: "admin" | "coach" | "player" = "coach";
// const canEdit = role === "admin" || role === "coach";

// /* ================= TYPES ================= */
// type Event = {
//   id: number;
//   title: string;
//   start: Date;
//   end: Date;
// };

// type UndoState = {
//   event: Event;
//   timeoutId: NodeJS.Timeout;
// } | null;

// /* ================= COLOR LOGIC ================= */
// const getEventStyle = (title: string, id: number) => {
//   const t = title.toLowerCase();

//   if (t.includes("match"))
//     return "bg-orange-50 border-orange-300 text-orange-800";
//   if (t.includes("training") || t.includes("drills"))
//     return "bg-blue-50 border-blue-300 text-blue-800";
//   if (t.includes("evaluation"))
//     return "bg-purple-50 border-purple-300 text-purple-800";

//   const colors = [
//     "bg-green-50 border-green-300 text-green-800",
//     "bg-pink-50 border-pink-300 text-pink-800",
//     "bg-yellow-50 border-yellow-300 text-yellow-800",
//     "bg-indigo-50 border-indigo-300 text-indigo-800",
//   ];

//   return colors[id % colors.length];
// };

// /* ================= COMPONENT ================= */
// const CalendarPage = () => {
//   const [currentDate, setCurrentDate] = useState(new Date(2025, 1, 1));
//   const [events, setEvents] = useState<Event[]>([]);
//   const [undoState, setUndoState] = useState<UndoState>(null);

//   /* ---------- Modal ---------- */
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalMode, setModalMode] = useState<"create" | "edit">("create");
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
//   const [hasLoaded, setHasLoaded] = useState(false);


//   const [formData, setFormData] = useState({
//     title: "",
//     startTime: "10:00",
//     endTime: "11:00",
//   });

//   /* ================= DATE CALCS ================= */
//   const year = currentDate.getFullYear();
//   const month = currentDate.getMonth();
//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const firstDayOfMonth = new Date(year, month, 1).getDay();

//   /* ================= LOAD + MIGRATION ================= */
//   useEffect(() => {
//   const newKey = localStorage.getItem("calendar_events");

//   if (newKey) {
//     setEvents(
//       JSON.parse(newKey).map((e: any) => ({
//         ...e,
//         start: new Date(e.start),
//         end: new Date(e.end),
//       }))
//     );
//     setHasLoaded(true);
//     return;
//   }

//   const legacy = localStorage.getItem("dashboard_events");
//   if (legacy) {
//     const parsed = JSON.parse(legacy).map((e: any) => ({
//       ...e,
//       start: new Date(e.start),
//       end: new Date(e.end),
//     }));

//     localStorage.setItem("calendar_events", JSON.stringify(parsed));
//     setEvents(parsed);
//   }

//   setHasLoaded(true);
// }, []);


//   /* ================= SAVE ================= */
// useEffect(() => {
//   if (!hasLoaded) return; // ⛔ Prevent overwrite on refresh
//   localStorage.setItem("calendar_events", JSON.stringify(events));
// }, [events, hasLoaded]);

//   /* ================= GROUP EVENTS ================= */
//   const eventsByDay = useMemo(() => {
//     const map: Record<string, Event[]> = {};
//     events.forEach(evt => {
//       const key = evt.start.toDateString();
//       if (!map[key]) map[key] = [];
//       map[key].push(evt);
//     });
//     return map;
//   }, [events]);

//   /* ================= MONTH NAV ================= */
//   const goPrevMonth = () =>
//     setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));

//   const goNextMonth = () =>
//     setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

//   /* ================= HANDLERS ================= */
//   const openCreate = (day: number) => {
//     if (!canEdit) return;
//     setSelectedDate(new Date(year, month, day));
//     setFormData({ title: "", startTime: "10:00", endTime: "11:00" });
//     setModalMode("create");
//     setIsModalOpen(true);
//   };

//   const openEdit = (e: React.MouseEvent, evt: Event) => {
//     if (!canEdit) return;
//     e.stopPropagation();

//     setSelectedEvent(evt);
//     setFormData({
//       title: evt.title,
//       startTime: evt.start.toTimeString().slice(0, 5),
//       endTime: evt.end.toTimeString().slice(0, 5),
//     });

//     setModalMode("edit");
//     setIsModalOpen(true);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     const [sh, sm] = formData.startTime.split(":").map(Number);
//     const [eh, em] = formData.endTime.split(":").map(Number);

//     if (modalMode === "create" && selectedDate) {
//       const start = new Date(selectedDate);
//       start.setHours(sh, sm);

//       const end = new Date(selectedDate);
//       end.setHours(eh, em);

//       if (end <= start) {
//         alert("End time must be after start time");
//         return;
//       }

//       setEvents(prev => [
//         ...prev,
//         { id: Date.now(), title: formData.title, start, end },
//       ]);
//     }

//     if (modalMode === "edit" && selectedEvent) {
//       setEvents(prev =>
//         prev.map(evt => {
//           if (evt.id !== selectedEvent.id) return evt;

//           const start = new Date(evt.start);
//           start.setHours(sh, sm);

//           const end = new Date(evt.start);
//           end.setHours(eh, em);

//           if (end <= start) return evt;

//           return { ...evt, title: formData.title, start, end };
//         })
//       );
//     }

//     closeModal();
//   };

//   const handleDelete = () => {
//     if (!selectedEvent) return;

//     const deleted = selectedEvent;
//     setEvents(prev => prev.filter(e => e.id !== deleted.id));

//     const timeoutId = setTimeout(() => setUndoState(null), 5000);
//     setUndoState({ event: deleted, timeoutId });

//     closeModal();
//   };

//   const undoDelete = () => {
//     if (!undoState) return;
//     clearTimeout(undoState.timeoutId);
//     setEvents(prev => [...prev, undoState.event]);
//     setUndoState(null);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedEvent(null);
//     setSelectedDate(null);
//   };

//   /* ================= DRAG & DROP ================= */
//   const onDragStart = (e: React.DragEvent, id: number) => {
//     if (!canEdit) return;
//     e.dataTransfer.setData("eventId", id.toString());
//   };

//   const onDrop = (e: React.DragEvent, day: number) => {
//     if (!canEdit) return;

//     const id = Number(e.dataTransfer.getData("eventId"));

//     setEvents(prev =>
//       prev.map(evt => {
//         if (evt.id !== id) return evt;

//         const duration = evt.end.getTime() - evt.start.getTime();
//         const newStart = new Date(evt.start);
//         newStart.setDate(day);

//         return {
//           ...evt,
//           start: newStart,
//           end: new Date(newStart.getTime() + duration),
//         };
//       })
//     );
//   };

//   /* ================= RENDER ================= */
//   return (
//     <div className="bg-white p-4 rounded-md m-4 relative">
//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-xl font-semibold">Calendar</h1>
//         <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border">
//           <Button onClick={goPrevMonth}>«</Button>
//           <span className="font-semibold w-36 text-center">
//             {currentDate.toLocaleString("default", {
//               month: "long",
//               year: "numeric",
//             })}
//           </span>
//           <Button onClick={goNextMonth}>»</Button>
//         </div>

//         {canEdit && (
//           <Button onClick={() => openCreate(1)} className="rounded-full">
//             <Plus size={16} />
//           </Button>
//         )}
//       </div>

//       {/* GRID */}
//       <div className="grid grid-cols-7 gap-2">
//         {[...Array(firstDayOfMonth)].map((_, i) => (
//           <div key={i} />
//         ))}

//         {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
//           const key = new Date(year, month, day).toDateString();
//           const dayEvents = eventsByDay[key] || [];

//           return (
//             <div
//               key={day}
//               onClick={() => openCreate(day)}
//               onDragOver={e => e.preventDefault()}
//               onDrop={e => onDrop(e, day)}
//               className="border rounded-md p-2 min-h-[120px] cursor-pointer"
//             >
//               <div className="text-xs font-semibold mb-1">{day}</div>

//               {dayEvents.map(evt => (
//                 <div
//                   key={evt.id}
//                   draggable={canEdit}
//                   onDragStart={e => onDragStart(e, evt.id)}
//                   onClick={e => openEdit(e, evt)}
//                   className={`text-xs p-2 rounded border mb-1 ${getEventStyle(
//                     evt.title,
//                     evt.id
//                   )}`}
//                 >
//                   <div className="font-semibold truncate">{evt.title}</div>
//                   <div className="opacity-70 text-[10px]">
//                     {evt.start.toLocaleTimeString([], {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                     {" – "}
//                     {evt.end.toLocaleTimeString([], {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           );
//         })}
//       </div>

//       {/* MODAL */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-md w-[90%] max-w-md relative">
//             <Button onClick={closeModal} className="absolute top-3 right-3">
//               <X size={16} />
//             </Button>

//             <form onSubmit={handleSubmit} className="flex flex-col gap-3">
//               <input
//                 value={formData.title}
//                 onChange={e =>
//                   setFormData({ ...formData, title: e.target.value })
//                 }
//                 placeholder="Event title"
//                 required
//                 className="border p-2 rounded"
//               />

//               <div className="flex gap-2">
//                 <input
//                   type="time"
//                   value={formData.startTime}
//                   onChange={e =>
//                     setFormData({ ...formData, startTime: e.target.value })
//                   }
//                   placeholder="Start time"
//                   title="Start time"
//                   className="border p-2 rounded w-full"
//                 />
//                 <input
//                   type="time"
//                   value={formData.endTime}
//                   onChange={e =>
//                     setFormData({ ...formData, endTime: e.target.value })
//                   }
//                   placeholder="End time"
//                   title="End time"
//                   className="border p-2 rounded w-full" 
//                 />
//               </div>

//               <div className="flex gap-2 mt-4">
//                 {modalMode === "edit" && (
//                   <Button
//                     type="button"
//                     onClick={handleDelete}
//                     className="bg-red-500"
//                   >
//                     <Trash2 size={16} /> Delete
//                   </Button>
//                 )}
//                 <Button type="submit">
//                   <Check size={16} /> Save
//                 </Button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* UNDO */}
//       {undoState && (
//         <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-md flex items-center gap-3 shadow-lg">
//           <span>Event deleted</span>
//           <Button onClick={undoDelete} className="underline flex items-center gap-1">
//             <Undo size={14} /> Undo
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// };

import prisma from "@/lib/prisma";
import BigCalendar from "@/components/BigCalender"; // Import your component
import { currentUser } from "@clerk/nextjs/server";

const CalendarPage = async () => {
  
  // 1. GET USER ROLE
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;

  // 2. FETCH DATA FROM DB
  const data = await prisma.event.findMany();

  // 3. TRANSFORM DATA
  // React-Big-Calendar ko Date objects chahiye hote hain, lekin server se string bhejna safe hai
  const events = data.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startTime.toISOString(),
    end: event.endTime.toISOString(),
  }));

  return (
    <div className="flex-1 h-full p-4">
      <BigCalendar initialEvents={events} userRole={role} />
    </div>
  );
};

export default CalendarPage;