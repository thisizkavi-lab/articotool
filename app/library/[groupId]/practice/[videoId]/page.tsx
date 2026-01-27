"use client"

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { getLibrary, addSegmentsToVideo, deleteSegment, updateVideoLastPracticed, updateVideoTranscript, clearVideoSegments, updateVideoNotes } from '@/lib/library-storage'
import { LibraryService } from '@/lib/services/library-service'
import { useAppStore } from '@/lib/store'
import type { LibraryGroup, LibraryVideo, Recording } from '@/lib/types'
import { UnifiedPracticeView } from '@/components/unified-practice-view'

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

function parseTime(timeStr: string): number | null {
    const parts = timeStr.trim().split(':')
    if (parts.length === 2) {
        const mins = parseInt(parts[0], 10)
        const secs = parseInt(parts[1], 10)
        if (!isNaN(mins) && !isNaN(secs)) return mins * 60 + secs
    } else if (parts.length === 1) {
        const secs = parseInt(parts[0], 10)
        if (!isNaN(secs)) return secs
    }
    return null
}

export default function PracticePage({ params }: { params: Promise<{ groupId: string; videoId: string }> }) {
    const { groupId, videoId } = use(params)
    const router = useRouter()
    const { user } = useAppStore()

    const [group, setGroup] = useState<LibraryGroup | null>(null)
    const [video, setVideo] = useState<LibraryVideo | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isBulkAdding, setIsBulkAdding] = useState(false)
    const [recordings, setRecordings] = useState<Recording[]>([])

    const loadData = useCallback(async () => {
        setIsLoading(true)
        try {
            if (user) {
                const library = await LibraryService.getLibrary()
                if (library) {
                    const foundGroup = library.groups.find(g => g.id === groupId)
                    const foundVideo = foundGroup?.videos.find(v => v.id === videoId)
                    setGroup(foundGroup || null)
                    setVideo(foundVideo || null)
                }
            } else {
                const library = await getLibrary()
                const foundGroup = library.groups.find(g => g.id === groupId)
                const foundVideo = foundGroup?.videos.find(v => v.id === videoId)
                setGroup(foundGroup || null)
                setVideo(foundVideo || null)
            }

            if (!user) {
                await updateVideoLastPracticed(groupId, videoId)
            }
        } catch (error) {
            console.error("Failed to load data:", error)
        } finally {
            setIsLoading(false)
        }
    }, [groupId, videoId, user])

    useEffect(() => {
        loadData()
    }, [loadData])

    const handleAddSegments = async (segments: { start: number; end: number; label: string; lines: any[] }[], replaceTranscript?: boolean) => {
        setIsBulkAdding(true)
        try {
            if (replaceTranscript) {
                const allLines = segments.flatMap(s => s.lines).sort((a, b) => a.start - b.start)
                if (user) {
                    await LibraryService.updateVideoTranscript(groupId, videoId, allLines)
                } else {
                    await updateVideoTranscript(groupId, videoId, allLines)
                }
            }

            if (user) {
                await LibraryService.addSegmentsToVideo(groupId, videoId, segments)
            } else {
                await addSegmentsToVideo(groupId, videoId, segments)
            }
            await loadData()
        } catch (e) {
            console.error(e)
        } finally {
            setIsBulkAdding(false)
        }
    }

    const handleClearSegments = async () => {
        if (!confirm("Are you sure you want to delete ALL segments? This cannot be undone.")) return
        try {
            if (user) {
                await LibraryService.clearVideoSegments(groupId, videoId)
            } else {
                await clearVideoSegments(groupId, videoId)
            }
            await loadData()
        } catch (e) {
            console.error("Failed to clear segments:", e)
        }
    }

    const handleDeleteSegment = async (segmentId: string) => {
        if (confirm('Delete this segment?')) {
            if (user) {
                await LibraryService.deleteSegment(groupId, videoId, segmentId)
            } else {
                await deleteSegment(groupId, videoId, segmentId)
            }
            await loadData()
        }
    }

    const handleSaveRecording = async (rec: Recording) => {
        setRecordings(prev => [...prev, rec])
    }

    const handleDeleteRecording = async (id: string) => {
        setRecordings(prev => prev.filter(r => r.id !== id))
    }

    const handleUpdateNotes = async (notes: string) => {
        if (user) {
            await LibraryService.updateVideoNotes(groupId, videoId, notes)
        } else {
            await updateVideoNotes(groupId, videoId, notes)
        }
        await loadData()
    }

    const handleUpdateTranscript = async (transcript: any[]) => {
        if (user) {
            await LibraryService.updateVideoTranscript(groupId, videoId, transcript)
        } else {
            await updateVideoTranscript(groupId, videoId, transcript)
        }
        await loadData()
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!group || !video) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Video not found</h2>
                    <Button onClick={() => router.push('/library')}>Back to Library</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/library/${groupId}`)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-semibold tracking-tight line-clamp-1">{video.title}</h1>
                            <p className="text-xs text-muted-foreground">
                                {group.emoji} {group.name} • {video.segments.length} segments
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-6">
                <UnifiedPracticeView
                    video={video}
                    recordings={recordings}
                    onAddSegments={handleAddSegments}
                    onClearSegments={handleClearSegments}
                    onDeleteSegment={handleDeleteSegment}
                    onSaveRecording={handleSaveRecording}
                    onDeleteRecording={handleDeleteRecording}
                    onUpdateNotes={handleUpdateNotes}
                    onUpdateTranscript={handleUpdateTranscript}
                />
            </main>
        </div>
    )
}

