"use client";

import { Calendar, momentLocalizer, View, Views, ToolbarProps, Navigate } from "react-big-calendar";
import moment from "moment";
import { useState, useEffect } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { createEvent, updateEvent, deleteEvent } from "@/lib/calendarActions";
import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";

const localizer = momentLocalizer(moment);

interface EventType {
  id: string;
  title: string;
  start: Date;
  end: Date;
  teamId?: string; // Optional for display
}

interface BigCalendarProps {
  initialEvents: { id: string; title: string; start: string; end: string }[];
  userRole: string;
  teams?: { id: string; name: string }[]; // ✅ Optional mark (?) lagaya
}

const BigCalendar = ({ initialEvents, userRole, teams=[] }: BigCalendarProps) => {
  
  const [view, setView] = useState<View>(Views.WORK_WEEK);
  const [date, setDate] = useState(new Date());
  
  
  const [events, setEvents] = useState<EventType[]>(
    (initialEvents || []).map(e => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end)
    }))
  );

  useEffect(() => {
    if(initialEvents) {
        setEvents(initialEvents.map(e => ({
            ...e,
            start: new Date(e.start),
            end: new Date(e.end)
        })));
    }
  }, [initialEvents]);

  const canEdit = userRole === "admin" || userRole === "coach";

  // --- MODAL STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // ✅ Added teamId to Form Data
  const [formData, setFormData] = useState({ 
      title: "", 
      start: new Date(), 
      end: new Date(),
      teamId: "" 
  });

  // --- HANDLERS ---
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (!canEdit) return;
    setModalMode("create");
    
    // ✅ SAFETY CHECK: Agar teams empty hai to crash nahi karega
    const defaultTeamId = teams && teams.length > 0 ? teams[0].id : "";

    setFormData({ 
        title: "", 
        start: slotInfo.start, 
        end: slotInfo.end,
        teamId: defaultTeamId 
    });
    setIsOpen(true);
  };

  const handleSelectEvent = (event: EventType) => {
    if (!canEdit) return;
    setModalMode("edit");
    setSelectedEventId(event.id);
    setFormData({ 
        title: event.title, 
        start: event.start, 
        end: event.end,
        teamId: event.teamId || "" 
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalMode === "create") {
        if(!formData.teamId) {
            alert("Please select a team!");
            return;
        }

        const tempId = Math.random().toString();
        const newEvent = { id: tempId, title: formData.title, start: formData.start, end: formData.end };
        setEvents([...events, newEvent]);
        setIsOpen(false);

        // ✅ PASS TEAM ID TO SERVER
        await createEvent({ 
            title: formData.title, 
            start: formData.start, 
            end: formData.end,
            teamId: formData.teamId 
        });
    } 
    else if (modalMode === "edit" && selectedEventId) {
        setEvents(events.map(ev => ev.id === selectedEventId ? { ...ev, ...formData } : ev));
        setIsOpen(false);
        await updateEvent(selectedEventId, { title: formData.title, start: formData.start, end: formData.end });
    }
  };

  const handleDelete = async () => {
    if (!selectedEventId) return;
    setEvents(events.filter(ev => ev.id !== selectedEventId));
    setIsOpen(false);
    await deleteEvent(selectedEventId);
  };

  const handleNavigate = (newDate: Date) => setDate(newDate);
  const handleOnChangeView = (selectedView: View) => setView(selectedView);

  const CustomToolbar = (toolbar: ToolbarProps<EventType, object>) => {
     // ... (Old Toolbar Code Same as Before) ...
     // Keeping it short here to save space, paste your old toolbar code
     const goToView = (view: View) => toolbar.onView(view);
     const goToBack = () => toolbar.onNavigate(Navigate.PREVIOUS);
     const goToNext = () => toolbar.onNavigate(Navigate.NEXT);
     const goToToday = () => toolbar.onNavigate(Navigate.TODAY);
 
     return (
       <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 p-1">
         <div className="flex items-center gap-3">
             <button type="button" onClick={goToToday} className="text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors">Today</button>
             <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 p-0.5">
                 <button type="button" onClick={goToBack} className="p-1.5 hover:bg-white rounded-md text-gray-500"><span className="font-bold">{'<'}</span></button>
                 <button type="button" onClick={goToNext} className="p-1.5 hover:bg-white rounded-md text-gray-500"><span className="font-bold">{'>'}</span></button>
             </div>
             <h2 className="text-xl font-bold text-gray-800 tracking-tight ml-2">{toolbar.label}</h2>
         </div>
         <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
           <button type="button" onClick={() => goToView(Views.WORK_WEEK)} className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${view === Views.WORK_WEEK ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400'}`}>Week</button>
           <button type="button" onClick={() => goToView(Views.DAY)} className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${view === Views.DAY ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400'}`}>Day</button>
         </div>
       </div>
     );
  };

  return (
    <div className="h-full bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
      <style>{`
        .rbc-header { padding: 12px 0; font-size: 13px; font-weight: 700; color: #6B7280; border-bottom: none !important; text-transform: uppercase; }
        .rbc-time-view, .rbc-time-content, .rbc-time-header-content { border: none !important; }
        .rbc-day-slot .rbc-time-slot { border-top: 1px dashed #f3f4f6 !important; }
        .rbc-time-gutter .rbc-timeslot-group { border-right: 1px solid #f3f4f6; font-size: 11px; }
        .rbc-current-time-indicator { background-color: #F97316 !important; height: 2px !important; }
      `}</style>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={date}
        onNavigate={handleNavigate}
        views={[Views.WORK_WEEK, Views.DAY]}
        view={view}
        onView={handleOnChangeView}
        components={{ toolbar: CustomToolbar }}
        selectable={canEdit}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        min={new Date(0, 0, 0, 7, 0, 0)}
        max={new Date(0, 0, 0, 19, 0, 0)}
        eventPropGetter={(event) => ({
            style: {
                backgroundColor: '#E0F2F1',
                color: '#006D77',
                borderLeft: '4px solid #006D77',
                border: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'bold'
            }
        })}
        style={{ height: 600 }}
      />

      {/* --- MODAL --- */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-[90%] max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200">
                <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm" className="absolute top-3 right-3 text-gray-400">
                    <X size={18} />
                </Button>
                <h2 className="text-lg font-bold mb-4 text-gray-800">{modalMode === "create" ? "Add Event" : "Edit Event"}</h2>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                        <input className="border p-2 rounded-md text-sm w-full mt-1 focus:ring-2 ring-teal-500 outline-none" placeholder="e.g. Training Session" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required autoFocus />
                    </div>

                    {/* ✅ TEAM DROPDOWN (Only Show in Create Mode) */}
                    {modalMode === "create" && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Assign Team</label>
                            <select 
                                className="border p-2 rounded-md text-sm w-full mt-1 bg-white focus:ring-2 ring-teal-500 outline-none"
                                value={formData.teamId}
                                onChange={e => setFormData({...formData, teamId: e.target.value})}
                                required
                            >
                                <option value="" disabled>Select a Team</option>
                                {teams.map(team => (
                                    <option key={team.id} value={team.id}>{team.name}</option>
                                ))}
                            </select>
                            {teams.length === 0 && <p className="text-[10px] text-red-500 mt-1">No teams found. Please create a team first.</p>}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Start Time</label>
                            <input placeholder="start" type="time" className="border p-2 rounded-md text-sm w-full mt-1" value={moment(formData.start).format("HH:mm")} onChange={e => { const [h, m] = e.target.value.split(':'); const newDate = new Date(formData.start); newDate.setHours(parseInt(h), parseInt(m)); setFormData({...formData, start: newDate}); }} />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">End Time</label>
                            <input placeholder="end" type="time" className="border p-2 rounded-md text-sm w-full mt-1" value={moment(formData.end).format("HH:mm")} onChange={e => { const [h, m] = e.target.value.split(':'); const newDate = new Date(formData.end); newDate.setHours(parseInt(h), parseInt(m)); setFormData({...formData, end: newDate}); }} />
                        </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                        {modalMode === "edit" && (
                            <Button type="button" onClick={handleDelete} variant="destructive" className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                                <Trash2 size={16} className="mr-2"/> Delete
                            </Button>
                        )}
                        <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
                            {modalMode === "create" ? "Create Event" : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default BigCalendar;