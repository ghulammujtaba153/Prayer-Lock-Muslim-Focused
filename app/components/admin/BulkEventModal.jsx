"use client"

import React, { useState } from "react"
import { IoCloseOutline, IoCloudUploadOutline } from "react-icons/io5"

const BulkEventModal = ({ isOpen, onClose, onSuccess }) => {
    const [jsonInput, setJsonInput] = useState("")
    const [year, setYear] = useState(new Date().getFullYear())
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            // Validate JSON
            const parsedData = JSON.parse(jsonInput)
            
            await onSuccess({
                year: parseInt(year, 10),
                data: parsedData
            })
            
            setJsonInput("")
            onClose()
        } catch (err) {
            console.error("Bulk upload error:", err)
            setError(err.message || "Invalid JSON format or server error")
        } finally {
            setLoading(false)
        }
    }

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 5 }, (_, i) => currentYear + i - 1)

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e2329] w-full max-w-2xl rounded-2xl border border-[#2b3139] shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-[#2b3139]">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <IoCloudUploadOutline className="text-yellow-500" />
                        Bulk Add Events (JSON)
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
                        <label className="block text-sm font-medium text-[#848e9c] mb-1.5">Select Year</label>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-xl p-3 text-white focus:border-yellow-500 outline-none transition-all"
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#848e9c] mb-1.5">JSON Data</label>
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-xl p-3 text-white h-64 focus:border-yellow-500 outline-none resize-none transition-all font-mono text-sm placeholder:text-[#474d57]"
                            placeholder='{
  "JANUARY": [
    { "date": "1", "event": "Market Close—New Year’s Day" }
  ]
}'
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                            {error}
                        </div>
                    )}

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
                            disabled={loading || !jsonInput}
                            className="flex-1 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    Importing...
                                </>
                            ) : (
                                "Import Events"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default BulkEventModal
