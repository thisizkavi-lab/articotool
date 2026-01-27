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
    const [error, setError] = useState<string | null>(null)

    // Helper to parse time string "MM:SS" or "SS" to seconds
    const parseTime = (str: string): number | null => {
        const parts = str.split(':').map(Number)
        if (parts.some(isNaN)) return null

        if (parts.length === 2) {
            return parts[0] * 60 + parts[1]
        } else if (parts.length === 1) {
            return parts[0]
        }
        return null
    }

    const handleSubmit = async () => {
        setError(null)
        const lines = input.trim().split('\n')
        const segments: { start: number; label: string }[] = []

        // Pass 1: Parse input
        for (const line of lines) {
            if (!line.trim()) continue

            // Expected format: "MM:SS Label"
            const match = line.match(/^(\d{1,2}:\d{2}|\d+)\s*(.*)/)
            if (match) {
                const timeStr = match[1]
                const label = match[2] || `Segment ${segments.length + 1}`
                const start = parseTime(timeStr)

                if (start !== null) {
                    segments.push({ start, label })
                }
            }
        }

        if (segments.length === 0) {
            setError("No valid timestamps found. Use format: MM:SS Label")
            return
        }

        // Pass 2: Calculate end times (based on next segment)
        // Note: For the last segment, we don't know the end time without video duration. 
        // We will default it to start + 10s or similar, user can adjust.
        const finalizedSegments = segments.map((seg, index) => {
            let end = seg.start + 10 // Default 10s duration
            if (index < segments.length - 1) {
                end = segments[index + 1].start
            }
            return {
                start: seg.start,
                end,
                label: seg.label,
                lines: [] // Empty transcript initially
            }
        })

        await onAdd(finalizedSegments)
        setInput("")
    }

    return (
        <div className="space-y-4">
            <div>
                <Label>Paste Timestamps</Label>
                <div className="text-xs text-muted-foreground mb-2">
                    Format: <code>MM:SS Optional Label</code> (one per line)
                </div>
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="0:00 Intro&#10;0:30 Verse 1&#10;1:15 Chorus"
                    className="h-40 font-mono text-sm"
                />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button onClick={handleSubmit} disabled={!input.trim() || isLoading} className="w-full">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create {input.trim().split('\n').filter(l => l.trim()).length > 0 ? input.trim().split('\n').filter(l => l.trim()).length : ''} Segments
            </Button>
        </div>
    )
}
