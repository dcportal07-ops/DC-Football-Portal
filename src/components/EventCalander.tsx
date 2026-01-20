"use client";

import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import moment from "moment";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

// ✅ UPDATE INTERFACE: Allow string | Date
interface EventItem {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
}

const colors = [
  "border-blue-400",
  "border-yellow-400",
  "border-purple-400",
  "border-green-400",
  "border-orange-400",
];

const EventCalendar = ({ events = [] }: { events?: EventItem[] }) => {
  const [value, onChange] = useState<Value>(new Date());
  const [showAll, setShowAll] = useState(false);

  // Filter events based on selected date (Optional: currently showing all)
  const visibleEvents = showAll ? events : events.slice(0, 5);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm h-fit">
      {/* CALENDAR */}
      <Calendar
        onChange={onChange}
        value={value}
        className="w-full border-none font-sans !bg-transparent"
      />

      {/* HEADER */}
      <div className="flex justify-between items-center mt-6 mb-4">
        <h1 className="text-lg font-bold text-gray-800">Latest Events</h1>

        {events.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-semibold text-teal-600 hover:underline"
          >
            {showAll ? "Show Less" : "View More"}
          </button>
        )}
      </div>

      {/* EVENTS LIST */}
      <div className="flex flex-col gap-4">
        {visibleEvents.map((event, index) => (
          <div
            key={event.id}
            className={`
              p-3 rounded-lg border-2 border-gray-100
              border-t-0 border-r-0 border-b-0 border-l-4
              ${colors[index % colors.length]}
              bg-gray-50 hover:bg-white hover:shadow-md transition-all
            `}
          >
            <div className="flex justify-between items-center mb-1">
              <h2 className="font-semibold text-gray-700 text-sm">
                {event.title}
              </h2>
              <span className="text-[10px] text-gray-400 font-medium">
                {moment(event.start).format("hh:mm A")}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              {moment(event.start).format("DD MMM YYYY")}
            </p>
          </div>
        ))}

        {events.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            No upcoming events
          </p>
        )}
      </div>
    </div>
  );
};

export default EventCalendar;