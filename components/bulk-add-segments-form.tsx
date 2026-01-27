"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface BulkAddSegmentsFormProps {
    onAdd: (segments: { start: number; end: number; label: string; lines: any[] }[]) => Promise<void>
    isLoading: boolean
}

export function BulkAddSegmentsForm({ onAdd, isLoading }: BulkAddSegmentsFormProps) {
    const [input, setInput] = useState("")
    const [replaceTranscript, setReplaceTranscript] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Helper to parse time string "HH:MM:SS", "MM:SS" or "SS" to seconds
    const parseTime = (str: string): number | null => {
        const parts = str.split(':').map(Number)
        if (parts.some(isNaN)) return null

        if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2]
        } else if (parts.length === 2) {
            return parts[0] * 60 + parts[1]
        } else if (parts.length === 1) {
            return parts[0]
        }
        return null
    }

    const handleSubmit = async () => {
        setError(null)
        const lines = input.trim().split('\n')
        const segments: { start: number; label: string; manualTranscript: string[] }[] = []
        let currentSegmentIndex = -1

        // Pass 1: Parse input
        for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine) continue

            // Check for Timestamp start: "HH:MM:SS", "MM:SS" or "SS"
            const match = trimmedLine.match(/^(\d{1,2}:\d{1,2}:\d{2}|\d{1,2}:\d{2}|\d+)\s*(.*)/)

            // If it looks like a timestamp, start a new segment
            if (match) {
                const timeStr = match[1]
                const label = match[2] || `Segment ${segments.length + 1}`
                const start = parseTime(timeStr)

                if (start !== null) {
                    segments.push({ start, label, manualTranscript: [] })
                    currentSegmentIndex = segments.length - 1
                } else {
                    // Failed parse, treat as text for previous segment
                    if (currentSegmentIndex >= 0) {
                        segments[currentSegmentIndex].manualTranscript.push(trimmedLine)
                    }
                }
            } else {
                // Not a timestamp, append to current segment's transcript
                if (currentSegmentIndex >= 0) {
                    segments[currentSegmentIndex].manualTranscript.push(trimmedLine)
                }
            }
        }

        if (segments.length === 0) {
            setError("No valid timestamps found. Start lines with MM:SS or HH:MM:SS")
            return
        }

        // Pass 2: Calculate end times and format transcript
        const finalizedSegments = segments.map((seg, index) => {
            let end = seg.start + 10 // Default 10s duration
            if (index < segments.length - 1) {
                end = segments[index + 1].start
            }

            // Create a single TranscriptLine for the whole manual text block
            const lines = seg.manualTranscript.length > 0 ? [{
                text: seg.manualTranscript.join(' '),
                start: seg.start,
                duration: end - seg.start // rough estimate
            }] : []

            return {
                start: seg.start,
                end,
                label: seg.label,
                lines
            }
        })

        await onAdd(finalizedSegments)
        setInput("")
    }

    return (
        <div className="space-y-4">
            <div>
                <Label>Paste Timestamps & Text</Label>
                <div className="text-xs text-muted-foreground mb-2 space-y-1">
                    <p>Format: <code>MM:SS Label</code> or <code>HH:MM:SS Label</code></p>
                    <p>Lines following a timestamp are added as transcript text.</p>
                </div>
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="0:00 Intro&#10;Hello everyone&#10;&#10;1:05:30 Long Segment&#10;Starting the deep dive..."
                    className="h-60 font-mono text-sm"
                />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button onClick={handleSubmit} disabled={!input.trim() || isLoading} className="w-full">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create {input.trim().split('\n').filter(l => l.match(/^(\d{1,2}:\d{1,2}:\d{2}|\d{1,2}:\d{2}|\d+)/)).length} Segments
            </Button>
        </div>
    )
}
