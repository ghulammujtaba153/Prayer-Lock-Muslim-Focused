"use client"

import React, { useState, useEffect, useRef } from "react";
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
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventColor, setEventColor] = useState("#3788d8");

  // Load events from localStorage on mount
  useEffect(() => {
    const storedEvents = localStorage.getItem("calendarEvents");
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (events.length > 0 || localStorage.getItem("calendarEvents")) {
      localStorage.setItem("calendarEvents", JSON.stringify(events));
    }
  }, [events]);

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setShowModal(true);
    setEventTitle("");
    setEventColor("#3788d8");
  };

  const handleEventClick = (clickInfo: any) => {
    if (confirm(`Delete event '${clickInfo.event.title}'?`)) {
      const updatedEvents = events.filter((event) => event.id !== clickInfo.event.id);
      setEvents(updatedEvents);
    }
  };

  const handleAddEvent = () => {
    if (!eventTitle.trim()) {
      alert("Please enter an event title");
      return;
    }

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventTitle,
      start: selectedDate,
      backgroundColor: eventColor,
      borderColor: eventColor,
    };

    setEvents([...events, newEvent]);
    setShowModal(false);
    setEventTitle("");
  };

  return (
    <div className="w-full h-full p-6 bg-[#1e2329] rounded-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Trading Calendar</h1>
        <p className="text-[#848e9c]">Track important trading events and deadlines</p>
      </div>

      {/* FullCalendar */}
      <div className="bg-[#2b3139] rounded-lg p-4 calendar-container" style={{ minHeight: '700px' }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events as EventInput[]}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          height="650px"
          eventDisplay="block"
          dayMaxEvents={false}
        />
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2b3139] rounded-lg p-6 w-96 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Add Event</h2>
            <p className="text-[#848e9c] mb-4">Date: {selectedDate}</p>

            <div className="mb-4">
              <label className="block text-white mb-2">Event Title</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-4 py-2 bg-[#1e2329] text-white rounded-lg border border-[#474d57] focus:outline-none focus:border-yellow-500"
                placeholder="Enter event title"
              />
            </div>

            <div className="mb-6">
              <label className="block text-white mb-2">Event Color</label>
              <div className="flex gap-2">
                {["#3788d8", "#f0b90b", "#ef4444", "#10b981", "#8b5cf6"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setEventColor(color)}
                    className={`w-10 h-10 rounded-full border-2 ${
                      eventColor === color ? "border-white scale-110" : "border-transparent"
                    } transition-all`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddEvent}
                className="flex-1 bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Add Event
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-[#474d57] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#5e6673] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for FullCalendar */}
      <style jsx global>{`
        .calendar-container .fc {
          color: #ffffff;
        }
        .calendar-container .fc-button {
          background-color: #474d57;
          border-color: #474d57;
          color: white;
        }
        .calendar-container .fc-button:hover {
          background-color: #5e6673;
        }
        .calendar-container .fc-button-active {
          background-color: #f0b90b !important;
          border-color: #f0b90b !important;
          color: black !important;
        }
        .calendar-container .fc-daygrid-day {
          background-color: #1e2329;
          min-height: 100px;
        }
        .calendar-container .fc-daygrid-day:hover {
          background-color: #2b3139;
          cursor: pointer;
        }
        .calendar-container .fc-col-header-cell {
          background-color: #474d57;
          color: white;
          padding: 10px;
        }
        .calendar-container .fc-event {
          cursor: pointer;
          padding: 4px 6px;
          margin: 2px 4px;
          font-size: 13px;
          white-space: normal;
          overflow: visible;
          text-overflow: clip;
        }
        .calendar-container .fc-event-title {
          white-space: normal;
          overflow: visible;
        }
        .calendar-container .fc-daygrid-day-number {
          color: #848e9c;
          padding: 8px;
          font-size: 14px;
        }
        .calendar-container .fc-day-today {
          background-color: #2b3139 !important;
        }
        .calendar-container .fc-daygrid-day-events {
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}