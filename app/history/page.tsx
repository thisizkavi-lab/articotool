"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StorageService, type SavedSession } from '@/lib/storage'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Play, Calendar, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

export default function HistoryPage() {
    const router = useRouter()
    const { setVideoId, setVideoTitle, setTranscript, setSegments, setNotes } = useAppStore()
    const [sessions, setSessions] = useState<SavedSession[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadHistory()
    }, [])

    const loadHistory = async () => {
        setIsLoading(true)
        try {
            const history = await StorageService.getHistory()
            setSessions(history)
        } catch (err) {
            console.error('Failed to load history:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleResume = async (session: SavedSession) => {
        // Save to current session key
        await StorageService.saveCurrentSession(session)

        // Update store state immediately (optional, but good for UX)
        setVideoId(session.videoId)
        setVideoTitle(session.videoTitle)
        setSegments(session.segments)
        setNotes(session.notes || '')

        // Navigate home
        router.push('/')
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Practice History</h1>
                        <p className="text-muted-foreground">Resume past sessions and review your progress</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-muted-foreground">Loading history...</div>
                ) : sessions.length === 0 ? (
                    <Card>
                        <CardContent className="py-20 text-center">
                            <p className="text-muted-foreground mb-4">No history saved yet.</p>
                            <Button onClick={() => router.push('/')}>Start a New Session</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {sessions.map((session) => (
                            <Card key={session.videoId || session.lastUpdated.toString()}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-medium">
                                            {session.videoTitle || 'Untitled Video'}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 text-xs">
                                            <Calendar className="h-3 w-3" />
                                            {format(session.lastUpdated, 'PPP p')}
                                        </CardDescription>
                                    </div>
                                    <Button size="sm" onClick={() => handleResume(session)}>
                                        <Play className="h-3 w-3 mr-2" />
                                        Resume
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground">
                                        {session.segments.length} segments created
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
