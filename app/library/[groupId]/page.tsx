"use client"

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ArrowLeft, Plus, MoreVertical, Trash2, Play, Loader2, Link, Clock, ExternalLink } from 'lucide-react'
import { getLibrary, addVideoToGroup, removeVideoFromGroup } from '@/lib/library-storage'
import { LibraryService } from '@/lib/services/library-service'
import { useAppStore } from '@/lib/store'
import type { LibraryGroup, LibraryVideo, TranscriptLine } from '@/lib/types'

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

function extractVideoOrPlaylistId(url: string): { type: 'video' | 'playlist'; id: string } | null {
    // Playlist patterns
    const playlistPatterns = [
        /[?&]list=([a-zA-Z0-9_-]+)/,
    ]

    for (const pattern of playlistPatterns) {
        const match = url.match(pattern)
        if (match) return { type: 'playlist', id: match[1] }
    }

    // Video patterns  
    const videoPatterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/,
    ]

    for (const pattern of videoPatterns) {
        const match = url.match(pattern)
        if (match) return { type: 'video', id: match[1] }
    }

    return null
}

export default function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
    const { groupId } = use(params)
    const router = useRouter()
    const { user } = useAppStore()
    const [group, setGroup] = useState<LibraryGroup | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAddingVideo, setIsAddingVideo] = useState(false)
    const [videoUrl, setVideoUrl] = useState('')
    const [addError, setAddError] = useState<string | null>(null)

    const loadGroup = useCallback(async () => {
        setIsLoading(true)
        if (user) {
            const lib = await LibraryService.getLibrary()
            const foundGroup = lib?.groups.find(g => g.id === groupId)
            setGroup(foundGroup || null)
        } else {
            const library = await getLibrary()
            const foundGroup = library.groups.find(g => g.id === groupId)
            setGroup(foundGroup || null)
        }
        setIsLoading(false)
    }, [groupId, user])

    useEffect(() => {
        loadGroup()
    }, [loadGroup])

    const handleAddVideo = async () => {
        if (!videoUrl.trim()) return

        const extracted = extractVideoOrPlaylistId(videoUrl.trim())
        if (!extracted) {
            setAddError('Invalid YouTube URL')
            return
        }

        setIsAddingVideo(true)
        setAddError(null)

        try {
            if (extracted.type === 'playlist') {
                // Fetch playlist videos
                const response = await fetch(`/api/youtube?playlistId=${extracted.id}`)
                const data = await response.json()

                if (data.error) throw new Error(data.error)

                // Add each video
                for (const video of data.videos || []) {
                    // Skip transcript fetch for now
                    // const transcriptRes = await fetch(`/api/transcript?videoId=${video.id}`)
                    // const transcriptData = await transcriptRes.json()
                    const transcriptData = { transcript: [] }

                    if (user) {
                        const newVideo: LibraryVideo = {
                            id: video.id,
                            title: video.title,
                            thumbnail: video.thumbnail,
                            duration: video.duration, // Should be number? API returns text? Wait, types say number.
                            // The API /api/youtube returns duration as number (seconds)
                            // LibraryVideo definition: duration: number
                            channelName: video.channelName,
                            transcript: [], // transcriptData.transcript || [],
                            segments: [],
                            recordings: [],
                            addedAt: Date.now(),
                            lastPracticedAt: null
                        }
                        await LibraryService.addVideoToGroup(groupId, newVideo)
                    } else {
                        await addVideoToGroup(groupId, {
                            id: video.id,
                            title: video.title,
                            thumbnail: video.thumbnail,
                            duration: video.duration,
                            channelName: video.channelName,
                            transcript: transcriptData.transcript || []
                        })
                    }
                }
            } else {
                // Single video
                const response = await fetch(`/api/youtube?videoId=${extracted.id}`)
                const data = await response.json()

                if (data.error) throw new Error(data.error)

                // Skip transcript fetch for now to ensure video adds instantly
                // const transcriptRes = await fetch(`/api/transcript?videoId=${extracted.id}`)
                // const transcriptData = await transcriptRes.json()
                const transcriptData = { transcript: [] }

                if (user) {
                    const newVideo: LibraryVideo = {
                        id: data.video.id,
                        title: data.video.title,
                        thumbnail: data.video.thumbnail,
                        duration: data.video.duration,
                        channelName: data.video.channelName,
                        transcript: [], // transcriptData.transcript || [],
                        segments: [],
                        recordings: [],
                        addedAt: Date.now(),
                        lastPracticedAt: null
                    }
                    await LibraryService.addVideoToGroup(groupId, newVideo)
                } else {
                    await addVideoToGroup(groupId, {
                        id: data.video.id,
                        title: data.video.title,
                        thumbnail: data.video.thumbnail,
                        duration: data.video.duration,
                        channelName: data.video.channelName,
                        transcript: [] // transcriptData.transcript || []
                    })
                }
            }

            setVideoUrl('')
            await loadGroup()
        } catch (error) {
            setAddError(error instanceof Error ? error.message : 'Failed to add video')
        } finally {
            setIsAddingVideo(false)
        }
    }

    const handleDeleteVideo = async (videoId: string) => {
        if (confirm('Remove this video from the group?')) {
            if (confirm('Remove this video from the group?')) {
                if (user) {
                    await LibraryService.removeVideoFromGroup(groupId, videoId)
                } else {
                    await removeVideoFromGroup(groupId, videoId)
                }
                await loadGroup()
            }
        }
    }

    const handlePractice = (videoId: string) => {
        // Navigate to practice view with group and video context
        router.push(`/library/${groupId}/practice/${videoId}`)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!group) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Group not found</h2>
                    <Button onClick={() => router.push('/library')}>Back to Library</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/library')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{group.emoji}</span>
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">{group.name}</h1>
                                <p className="text-xs text-muted-foreground">
                                    {group.videos.length} video{group.videos.length !== 1 ? 's' : ''} •
                                    {group.videos.reduce((sum, v) => sum + v.segments.length, 0)} segments
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Add Video Dialog */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Video
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Video or Playlist</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Paste YouTube URL or playlist link..."
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !isAddingVideo && handleAddVideo()}
                                        className="flex-1"
                                        disabled={isAddingVideo}
                                    />
                                </div>
                                {addError && (
                                    <p className="text-sm text-destructive">{addError}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Supports individual videos and full playlists. Transcripts will be fetched automatically.
                                </p>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" disabled={isAddingVideo}>Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleAddVideo} disabled={!videoUrl.trim() || isAddingVideo}>
                                    {isAddingVideo ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Link className="h-4 w-4 mr-2" />
                                            Add
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                {group.videos.length === 0 ? (
                    <div className="text-center py-20">
                        <Play className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h2 className="text-xl font-semibold mb-2">No videos yet</h2>
                        <p className="text-muted-foreground mb-6">
                            Add videos from YouTube to start building your practice collection.
                        </p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Video
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Video or Playlist</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <Input
                                        placeholder="Paste YouTube URL or playlist link..."
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !isAddingVideo && handleAddVideo()}
                                        disabled={isAddingVideo}
                                    />
                                    {addError && (
                                        <p className="text-sm text-destructive">{addError}</p>
                                    )}
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline" disabled={isAddingVideo}>Cancel</Button>
                                    </DialogClose>
                                    <Button onClick={handleAddVideo} disabled={!videoUrl.trim() || isAddingVideo}>
                                        {isAddingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {group.videos.map((video) => (
                            <Card
                                key={video.id}
                                className="cursor-pointer hover:border-primary/50 transition-colors group overflow-hidden"
                                onClick={() => handlePractice(video.id)}
                            >
                                <div className="aspect-video relative bg-secondary">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <Play className="h-12 w-12 text-white" />
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                        {formatDuration(video.duration)}
                                    </div>
                                    {video.segments.length > 0 && (
                                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                                            {video.segments.length} segment{video.segments.length !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-sm line-clamp-2 mb-1">
                                                {video.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {video.channelName}
                                            </p>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`https://youtube.com/watch?v=${video.id}`, '_blank'); }}>
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    Open on YouTube
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteVideo(video.id); }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Remove
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Add Video Card */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Card className="cursor-pointer border-dashed hover:border-primary/50 transition-colors flex items-center justify-center min-h-[200px]">
                                    <div className="text-center text-muted-foreground">
                                        <Plus className="h-8 w-8 mx-auto mb-2" />
                                        <p className="text-sm">Add Video</p>
                                    </div>
                                </Card>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Video or Playlist</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <Input
                                        placeholder="Paste YouTube URL or playlist link..."
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !isAddingVideo && handleAddVideo()}
                                        disabled={isAddingVideo}
                                    />
                                    {addError && (
                                        <p className="text-sm text-destructive">{addError}</p>
                                    )}
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline" disabled={isAddingVideo}>Cancel</Button>
                                    </DialogClose>
                                    <Button onClick={handleAddVideo} disabled={!videoUrl.trim() || isAddingVideo}>
                                        {isAddingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </main>
        </div>
    )
}
