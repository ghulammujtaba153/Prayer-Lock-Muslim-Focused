"use client"

import React, { useState } from "react"
import { IoCloseOutline } from "react-icons/io5"

const CalendarEventModal = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [eventData, setEventData] = useState({
        title: "",
        start: "",
        backgroundColor: "#3788d8",
        description: ""
    })

    React.useEffect(() => {
        if (initialData) {
            setEventData({
                title: initialData.title || "",
                start: initialData.start ? initialData.start.split('T')[0] : "",
                backgroundColor: initialData.backgroundColor || "#3788d8",
                description: initialData.description || ""
            })
        } else {
            setEventData({
                title: "",
                start: "",
                backgroundColor: "#3788d8",
                description: ""
            })
        }
    }, [initialData, isOpen])

    if (!isOpen) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        onSuccess(eventData)
        if (!initialData) {
            setEventData({
                title: "",
                start: "",
                backgroundColor: "#3788d8",
                description: ""
            })
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e2329] w-full max-w-md rounded-2xl border border-[#2b3139] shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-[#2b3139]">
                    <h2 className="text-xl font-bold text-white">
                        {initialData ? "Edit Event" : "Add New Event"}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-1 hover:bg-[#2b3139] rounded-lg transition-colors text-[#848e9c] hover:text-white"
                    >
                        <IoCloseOutline size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#848e9c] mb-1.5">Event Title</label>
                        <input
                            type="text"
                            value={eventData.title}
                            onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                            className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-xl p-3 text-white focus:border-yellow-500 outline-none transition-all placeholder:text-[#474d57]"
                            placeholder="e.g. FOMC Interest Rate Decision"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#848e9c] mb-1.5">Date</label>
                            <input
                                type="date"
                                value={eventData.start}
                                onChange={(e) => setEventData({ ...eventData, start: e.target.value })}
                                className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-xl p-3 text-white focus:border-yellow-500 outline-none transition-all color-scheme-dark"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#848e9c] mb-1.5">Priority Color</label>
                            <div className="flex gap-2 p-1.5 bg-[#0b0e11] border border-[#2b3139] rounded-xl">
                                {["#3788d8", "#f0b90b", "#ef4444", "#10b981", "#8b5cf6"].map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setEventData({ ...eventData, backgroundColor: color })}
                                        className={`w-7 h-7 rounded-full border-2 transition-all ${eventData.backgroundColor === color ? "border-white scale-110 shadow-lg shadow-white/10" : "border-transparent opacity-60 hover:opacity-100"}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#848e9c] mb-1.5">Description (Optional)</label>
                        <textarea
                            value={eventData.description}
                            onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                            className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-xl p-3 text-white h-28 focus:border-yellow-500 outline-none resize-none transition-all placeholder:text-[#474d57]"
                            placeholder="Additional details about this event..."
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-[#2b3139] hover:bg-[#363c45] text-white font-semibold rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-xl transition-colors shadow-lg shadow-yellow-500/10"
                        >
                            {initialData ? "Save Changes" : "Create Event"}
                        </button>
                    </div>
                </form>
            </div>
            
            <style jsx>{`
                .color-scheme-dark {
                    color-scheme: dark;
                }
            `}</style>
        </div>
    )
}

export default CalendarEventModal
