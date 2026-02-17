"use client"

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from "@fullcalendar/core";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
}

export default function CalenderSection() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  const fetchEvents = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/calendar`);
      const data = await response.json();
      setEvents(data.map((e: { _id: string; title: string; start: string; backgroundColor?: string }) => ({
        ...e,
        id: e._id // Map MongoDB _id to FullCalendar id
      })));
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Load events from API on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="w-full h-full p-6 bg-[#1e2329] rounded-lg shadow-xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Trading Calendar</h1>
          <p className="text-[#848e9c]">Track important market events and financial deadlines</p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-full text-sm font-medium">
            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            Syncing Events...
          </div>
        )}
      </div>

      {/* FullCalendar - Read Only View */}
      <div className="bg-[#2b3139] rounded-xl p-6 calendar-container shadow-inner" style={{ minHeight: '700px' }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events as EventInput[]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          height="650px"
          eventDisplay="block"
          dayMaxEvents={3}
          // Interaction settings
          selectable={false}
          editable={false}
        />
      </div>

      {/* Legend / Info */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "High Priority", color: "#ef4444" },
          { label: "Medium Priority", color: "#f0b90b" },
          { label: "Low Priority", color: "#3788d8" },
          { label: "Completed", color: "#10b981" },
          { label: "Other", color: "#8b5cf6" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 bg-[#1e2329] p-3 rounded-lg border border-[#474d57]/30">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
            <span className="text-xs text-[#848e9c] font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Custom CSS for FullCalendar */}
      <style jsx global>{`
        .calendar-container .fc {
          color: #ffffff;
          font-family: inherit;
        }
        .calendar-container .fc-toolbar-title {
          font-size: 1.25rem !important;
          font-weight: 700;
        }
        .calendar-container .fc-button {
          background-color: #1e2329 !important;
          border-color: #474d57 !important;
          color: #ffffff !important;
          text-transform: capitalize;
          font-weight: 500;
          transition: all 0.2s;
        }
        .calendar-container .fc-button:hover {
          background-color: #363c45 !important;
          border-color: #f0b90b !important;
        }
        .calendar-container .fc-button-active {
          background-color: #f0b90b !important;
          border-color: #f0b90b !important;
          color: #000000 !important;
        }
        .calendar-container .fc-daygrid-day {
          background-color: #0b0e11;
          min-height: 100px;
          border-color: #474d57 !important;
        }
        .calendar-container .fc-daygrid-day:hover {
          background-color: #1e2329;
        }
        .calendar-container .fc-col-header-cell {
          background-color: #1e2329;
          color: #848e9c;
          padding: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          border-color: #474d57 !important;
        }
        .calendar-container .fc-event {
          cursor: default;
          padding: 4px 8px;
          margin: 2px 4px;
          font-size: 12px;
          border-radius: 6px;
          border: none;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }
        .calendar-container .fc-event:hover {
          transform: translateY(-1px);
        }
        .calendar-container .fc-daygrid-day-number {
          color: #848e9c;
          padding: 10px;
          font-size: 13px;
          font-weight: 500;
        }
        .calendar-container .fc-day-today {
          background-color: #2b3139 !important;
        }
        .calendar-container .fc-daygrid-more-link {
          color: #f0b90b !important;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
        }
      `}</style>
    </div>
  );
}