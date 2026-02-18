"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { IoTrashOutline, IoAddCircleOutline, IoCalendarOutline, IoPencilOutline, IoCloudUploadOutline } from "react-icons/io5"
import CalendarEventModal from "./CalendarEventModal"
import BulkEventModal from "./BulkEventModal"

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000"

const CalenderAdminSection = () => {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null)

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/calendar`)
            setEvents(response.data)
        } catch (error) {
            console.error("Error fetching events:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateOrUpdateEvent = async (eventData) => {
        try {
            if (selectedEvent) {
                // Update
                const response = await axios.patch(`${API_BASE_URL}/calendar/${selectedEvent._id}`, eventData)
                setEvents(events.map(ev => ev._id === selectedEvent._id ? response.data : ev))
            } else {
                // Create
                const response = await axios.post(`${API_BASE_URL}/calendar`, eventData)
                setEvents([...events, response.data])
            }
            closeModal()
        } catch (error) {
            console.error("Error saving event:", error)
        }
    }

    const handleBulkUpload = async (bulkPayload) => {
        try {
            await axios.post(`${API_BASE_URL}/calendar/bulk`, bulkPayload)
            fetchEvents()
        } catch (error) {
            console.error("Error bulk uploading events:", error)
            throw error // Re-throw for modal error handling
        }
    }

    const handleDeleteEvent = async (id) => {
        if (!confirm("Are you sure you want to delete this event?")) return

        try {
            await axios.delete(`${API_BASE_URL}/calendar/${id}`)
            setEvents(events.filter(event => event._id !== id))
            if (selectedEvent?._id === id) closeModal()
        } catch (error) {
            console.error("Error deleting event:", error)
        }
    }

    const openCreateModal = () => {
        setSelectedEvent(null)
        setIsModalOpen(true)
    }

    const openEditModal = (event) => {
        setSelectedEvent(event)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedEvent(null)
    }

    const handleEventClick = (info) => {
        const eventId = info.event.id
        const event = events.find(e => e._id === eventId)
        if (event) openEditModal(event)
    }

    // Map events for FullCalendar
    const calendarEvents = events.map(event => ({
        id: event._id,
        title: event.title,
        start: event.start,
        backgroundColor: event.backgroundColor,
        borderColor: event.backgroundColor,
        extendedProps: { ...event }
    }))

    return (
        <div className="p-8 bg-[#0b0e11] min-h-screen text-white">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <IoCalendarOutline className="text-yellow-500" />
                        Admin Calendar
                    </h1>
                    <p className="text-[#848e9c] mt-1">Manage trading events and view them visually</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                        onClick={() => setIsBulkModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-[#2b3139] hover:bg-[#363c45] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95 border border-[#474d57]"
                    >
                        <IoCloudUploadOutline size={20} className="text-yellow-500" />
                        Bulk Add (JSON)
                    </button>
                    <button 
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-yellow-500/10 active:scale-95"
                    >
                        <IoAddCircleOutline size={20} />
                        Add Event
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Visual Calendar */}
                <div className="xl:col-span-2 bg-[#1e2329] rounded-2xl border border-[#2b3139] p-6 shadow-xl calendar-container">
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        events={calendarEvents}
                        eventClick={handleEventClick}
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth,dayGridWeek",
                        }}
                        height="auto"
                        eventDisplay="block"
                    />
                </div>

                {/* Events Table/List */}
                <div className="bg-[#1e2329] rounded-2xl border border-[#2b3139] overflow-hidden shadow-xl flex flex-col">
                    <div className="p-5 border-b border-[#2b3139] bg-[#2b3139]/30">
                        <h2 className="text-lg font-semibold flex items-center justify-between">
                            All Events
                            <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded-full">{events.length}</span>
                        </h2>
                    </div>
                    
                    <div className="overflow-y-auto max-h-[600px] flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <tbody className="divide-y divide-[#2b3139]">
                                {loading ? (
                                    <tr>
                                        <td className="px-6 py-12 text-center text-[#848e9c]">
                                            <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                            Loading...
                                        </td>
                                    </tr>
                                ) : events.length === 0 ? (
                                    <tr>
                                        <td className="px-6 py-12 text-center text-[#848e9c]">
                                            No events found
                                        </td>
                                    </tr>
                                ) : (
                                    events.map(event => (
                                        <tr key={event._id} className="hover:bg-[#2b3139]/30 transition-colors group">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: event.backgroundColor }}></div>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-white truncate text-sm" title={event.title}>{event.title}</div>
                                                        <div className="text-[11px] text-[#848e9c] mt-0.5">
                                                            {new Date(event.start).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditModal(event)}
                                                        className="p-1.5 text-[#848e9c] hover:text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <IoPencilOutline size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEvent(event._id)}
                                                        className="p-1.5 text-[#848e9c] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <IoTrashOutline size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CalendarEventModal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                onSuccess={handleCreateOrUpdateEvent}
                initialData={selectedEvent}
            />

            <BulkEventModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onSuccess={handleBulkUpload}
            />

            <style jsx global>{`
                .calendar-container .fc {
                    color: #ffffff;
                    font-size: 0.9rem;
                }
                .calendar-container .fc-button {
                    background-color: #2b3139;
                    border-color: #474d57;
                    color: white;
                    text-transform: capitalize;
                }
                .calendar-container .fc-button:hover {
                    background-color: #363c45;
                }
                .calendar-container .fc-button-active {
                    background-color: #f0b90b !important;
                    border-color: #f0b90b !important;
                    color: black !important;
                }
                .calendar-container .fc-daygrid-day {
                    background-color: #0b0e11;
                    min-height: 80px;
                }
                .calendar-container .fc-daygrid-day:hover {
                    background-color: #1e2329;
                    cursor: pointer;
                }
                .calendar-container .fc-col-header-cell {
                    background-color: #2b3139;
                    color: #848e9c;
                    padding: 8px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .calendar-container .fc-event {
                    cursor: pointer;
                    padding: 3px 6px;
                    margin: 1px 2px;
                    font-size: 11px;
                    border-radius: 4px;
                    border: none;
                    white-space: normal !important;
                    line-height: 1.2;
                    min-height: 1.8rem;
                    display: flex;
                    align-items: center;
                }
                .calendar-container .fc-daygrid-day-number {
                    color: #848e9c;
                    padding: 6px;
                }
                .calendar-container .fc-day-today {
                    background-color: #2b3139 !important;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #2b3139;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    )
}

export default CalenderAdminSection
