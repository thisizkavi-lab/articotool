"use client"

import { useState, useEffect, useCallback, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, RotateCcw, Repeat, Mic, Video, Square, Loader2, Clock, Trash2, Download, Circle, Play, FileText } from 'lucide-react'
import { getLibrary, addSegmentToVideo, deleteSegment, updateVideoLastPracticed } from '@/lib/library-storage'
import { LibraryService } from '@/lib/services/library-service'
import { useAppStore } from '@/lib/store'
import type { LibraryGroup, LibraryVideo } from '@/lib/types'
import { ScrollToActiveLine } from '@/components/ui/scroll-to-active'

declare global {
    interface Window {
        YT: {
            Player: new (elementId: string, options: object) => YTPlayer
            PlayerState: {
                PLAYING: number
                PAUSED: number
                ENDED: number
            }
        }
        onYouTubeIframeAPIReady: () => void
    }
}

interface YTPlayer {
    playVideo: () => void
    pauseVideo: () => void
    seekTo: (seconds: number, allowSeekAhead: boolean) => void
    getCurrentTime: () => number
    getPlayerState: () => number
    destroy: () => void
}

interface Recording {
    id: string
    segmentId: string
    blobUrl: string
    hasAudio: boolean
    hasVideo: boolean
    createdAt: number
}

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
    const [currentTime, setCurrentTime] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLooping, setIsLooping] = useState(true)
    const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null)

    // Right panel mode: "transcript" or "record"
    const [panelMode, setPanelMode] = useState<'transcript' | 'record'>('record')

    // Segment creation
    const [isCreatingSegment, setIsCreatingSegment] = useState(false)
    const [segmentStart, setSegmentStart] = useState<number | null>(null)
    const [segmentEnd, setSegmentEnd] = useState<number | null>(null)
    const [segmentLabel, setSegmentLabel] = useState('')
    const [startTimeInput, setStartTimeInput] = useState('')
    const [endTimeInput, setEndTimeInput] = useState('')

    // Recording state
    const [recordAudio, setRecordAudio] = useState(true)
    const [recordVideo, setRecordVideo] = useState(true)
    const [isRecording, setIsRecording] = useState(false)
    const [countdown, setCountdown] = useState<number | null>(null)
    const [recordingTime, setRecordingTime] = useState(0)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [recordings, setRecordings] = useState<Recording[]>([])
    const [isSyncPlaying, setIsSyncPlaying] = useState(false)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const streamRef = useRef<MediaStream | null>(null)
    const liveVideoRef = useRef<HTMLVideoElement>(null)
    const playbackVideoRef = useRef<HTMLVideoElement>(null)
    const playbackAudioRef = useRef<HTMLAudioElement>(null)
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

    const playerRef = useRef<YTPlayer | null>(null)
    const playerReadyRef = useRef(false)
    const timeUpdateRef = useRef<NodeJS.Timeout | null>(null)
    const progressBarRef = useRef<HTMLDivElement>(null)
    const transcriptContainerRef = useRef<HTMLDivElement>(null)
    const activeLineRef = useRef<HTMLDivElement>(null)

    const loadData = useCallback(async () => {
        setIsLoading(true)
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

        // Note: keeping lastPracticed update local-only for now or need to add to LibraryService
        if (!user) {
            await updateVideoLastPracticed(groupId, videoId)
        }

        setIsLoading(false)
    }, [groupId, videoId, user])

    useEffect(() => {
        loadData()
    }, [loadData])

    // Stop all media streams completely
    const stopAllStreams = () => {
        // Stop the stream stored in streamRef (used during recording)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        // Stop the stream attached to the video element (used for preview)
        if (liveVideoRef.current && liveVideoRef.current.srcObject) {
            const stream = liveVideoRef.current.srcObject as MediaStream
            stream.getTracks().forEach(track => track.stop())
            liveVideoRef.current.srcObject = null
        }
    }

    // Manage media stream lifecycle based on panel mode and recording state
    useEffect(() => {
        let cancelled = false

        const setupStream = async () => {
            // Only start preview when in record mode, not recording, and no preview URL
            if (panelMode === 'record' && !isRecording && !previewUrl && (recordVideo || recordAudio)) {
                // First stop any existing streams
                stopAllStreams()

                try {
                    // Get stream with both audio and video based on checkboxes
                    const constraints: MediaStreamConstraints = {
                        video: recordVideo ? { facingMode: 'user', width: 640, height: 480 } : false,
                        audio: recordAudio
                    }

                    const stream = await navigator.mediaDevices.getUserMedia(constraints)

                    if (cancelled) {
                        // If we were cancelled while waiting, stop the stream
                        stream.getTracks().forEach(track => track.stop())
                        return
                    }

                    streamRef.current = stream

                    // Only attach video tracks to the preview element
                    if (liveVideoRef.current && recordVideo) {
                        liveVideoRef.current.srcObject = stream
                        liveVideoRef.current.play().catch(() => { })
                    }
                } catch (err) {
                    console.error('Failed to start media stream:', err)
                }
            } else if (panelMode !== 'record') {
                // Stop streams when not in record mode
                stopAllStreams()
            }
        }

        setupStream()

        // Cleanup on unmount or when dependencies change
        return () => {
            cancelled = true
            if (panelMode !== 'record') {
                stopAllStreams()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [panelMode, isRecording, previewUrl, recordVideo, recordAudio])

    // Initialize YouTube player
    useEffect(() => {
        if (!video) return

        const initPlayer = () => {
            if (playerRef.current) {
                playerRef.current.destroy()
            }

            playerRef.current = new window.YT.Player('youtube-player', {
                videoId: video.id,
                playerVars: {
                    autoplay: 0,
                    controls: 1,
                    modestbranding: 1,
                    rel: 0,
                },
                events: {
                    onReady: () => {
                        playerReadyRef.current = true
                    },
                    onStateChange: (event: { data: number }) => {
                        setIsPlaying(event.data === window.YT.PlayerState.PLAYING)
                    },
                },
            })
        }

        if (window.YT && window.YT.Player) {
            initPlayer()
        } else {
            const tag = document.createElement('script')
            tag.src = 'https://www.youtube.com/iframe_api'
            const firstScriptTag = document.getElementsByTagName('script')[0]
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
            window.onYouTubeIframeAPIReady = initPlayer
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy()
                playerRef.current = null
            }
            playerReadyRef.current = false
        }
    }, [video])

    // Time update loop
    useEffect(() => {
        timeUpdateRef.current = setInterval(() => {
            if (playerRef.current && playerReadyRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                try {
                    const time = playerRef.current.getCurrentTime()
                    setCurrentTime(time)

                    if (isLooping && activeSegmentIndex !== null && video) {
                        const segment = video.segments[activeSegmentIndex]
                        if (segment && time >= segment.end) {
                            playerRef.current.seekTo(segment.start, true)
                        }
                    }
                } catch {
                    // Player not ready
                }
            }
        }, 100)

        return () => {
            if (timeUpdateRef.current) clearInterval(timeUpdateRef.current)
        }
    }, [isLooping, activeSegmentIndex, video])

    const playSegment = (index: number) => {
        if (!video || !playerRef.current || !playerReadyRef.current) return
        const segment = video.segments[index]
        if (!segment) return

        setActiveSegmentIndex(index)
        setIsLooping(true)
        playerRef.current.seekTo(segment.start, true)
        playerRef.current.playVideo()
    }

    const exitSegmentMode = () => {
        setActiveSegmentIndex(null)
        setIsLooping(false)
    }

    const handlePrevSegment = () => {
        if (activeSegmentIndex === null || activeSegmentIndex === 0) return
        playSegment(activeSegmentIndex - 1)
    }

    const handleNextSegment = () => {
        if (activeSegmentIndex === null || !video) return
        if (activeSegmentIndex >= video.segments.length - 1) return
        playSegment(activeSegmentIndex + 1)
    }

    const handleReplay = () => {
        if (activeSegmentIndex !== null) playSegment(activeSegmentIndex)
    }

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!activeSegment || !playerRef.current || !progressBarRef.current) return

        const rect = progressBarRef.current.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const percent = clickX / rect.width
        const newTime = activeSegment.start + (activeSegment.end - activeSegment.start) * percent

        playerRef.current.seekTo(newTime, true)
    }

    // Recording functions
    const startRecording = async () => {
        if (activeSegmentIndex === null || (!recordAudio && !recordVideo)) return

        // Countdown first (keep live preview visible during countdown)
        setCountdown(3)
        for (let i = 2; i >= 0; i--) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            setCountdown(i === 0 ? null : i)
        }

        try {
            // Use the existing stream from streamRef (already set up by startLivePreview)
            // If for some reason it's not there, create a new one
            let stream = streamRef.current

            if (!stream) {
                const constraints: MediaStreamConstraints = {
                    video: recordVideo ? { facingMode: 'user', width: 640, height: 480 } : false,
                    audio: recordAudio
                }
                stream = await navigator.mediaDevices.getUserMedia(constraints)
                streamRef.current = stream
            }

            // Make sure video element is showing the stream during recording
            if (liveVideoRef.current && recordVideo) {
                liveVideoRef.current.srcObject = stream
                await liveVideoRef.current.play().catch(() => { })
            }

            chunksRef.current = []

            // Try different mime types for better compatibility
            let mimeType = recordVideo ? 'video/webm;codecs=vp9' : 'audio/webm;codecs=opus'
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = recordVideo ? 'video/webm;codecs=vp8' : 'audio/webm'
            }
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = recordVideo ? 'video/webm' : 'audio/webm'
            }

            const mediaRecorder = new MediaRecorder(stream, { mimeType })

            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            mediaRecorder.onstop = () => {
                if (chunksRef.current.length > 0) {
                    const blob = new Blob(chunksRef.current, { type: mimeType })
                    const url = URL.createObjectURL(blob)
                    setPreviewUrl(url)
                } else {
                    console.error('No recording data captured')
                }

                // Stop the stream tracks after recording
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop())
                    streamRef.current = null
                }

                // Clear the video element
                if (liveVideoRef.current) {
                    liveVideoRef.current.srcObject = null
                }
            }

            mediaRecorderRef.current = mediaRecorder
            // Request data every 100ms for more reliable capture
            mediaRecorder.start(100)
            setIsRecording(true)
            setRecordingTime(0)

            // Start the segment video at the same time
            if (playerRef.current && activeSegment) {
                playerRef.current.seekTo(activeSegment.start, true)
                playerRef.current.playVideo()
            }

            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)
        } catch (err) {
            console.error('Failed to start recording:', err)
            setCountdown(null)
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
        }
    }

    const saveRecording = () => {
        if (!previewUrl || activeSegmentIndex === null || !video) return

        const activeSegment = video.segments[activeSegmentIndex]
        const recording: Recording = {
            id: `rec-${Date.now()}`,
            segmentId: activeSegment.id,
            blobUrl: previewUrl,
            hasAudio: recordAudio,
            hasVideo: recordVideo,
            createdAt: Date.now()
        }

        setRecordings(prev => [...prev, recording])
        setPreviewUrl(null)
    }

    const discardRecording = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
    }

    const downloadRecording = () => {
        if (!previewUrl) return
        const a = document.createElement('a')
        a.href = previewUrl
        a.download = `recording-${Date.now()}.webm`
        a.click()
    }

    const deleteRecording = (id: string) => {
        setRecordings(prev => prev.filter(r => r.id !== id))
    }

    // Sync playback: play segment video + user recording together
    const playSyncRecording = (rec: Recording) => {
        if (!activeSegment || !playerRef.current) return

        setIsSyncPlaying(true)
        playerRef.current.seekTo(activeSegment.start, true)
        playerRef.current.playVideo()

        if (rec.hasVideo && playbackVideoRef.current) {
            playbackVideoRef.current.src = rec.blobUrl
            playbackVideoRef.current.currentTime = 0
            playbackVideoRef.current.play()
        } else if (playbackAudioRef.current) {
            playbackAudioRef.current.src = rec.blobUrl
            playbackAudioRef.current.currentTime = 0
            playbackAudioRef.current.play()
        }
    }

    const playOnlyRecording = (rec: Recording) => {
        if (rec.hasVideo && playbackVideoRef.current) {
            playbackVideoRef.current.src = rec.blobUrl
            playbackVideoRef.current.currentTime = 0
            playbackVideoRef.current.play()
        } else if (playbackAudioRef.current) {
            playbackAudioRef.current.src = rec.blobUrl
            playbackAudioRef.current.currentTime = 0
            playbackAudioRef.current.play()
        }
    }

    const handleCreateSegment = async () => {
        if (segmentStart === null || segmentEnd === null || !segmentLabel.trim() || !video) return

        const lines = video.transcript.filter(
            line => line.start >= segmentStart && line.start < segmentEnd
        )

        if (user) {
            await LibraryService.addSegmentToVideo(groupId, videoId, {
                start: segmentStart,
                end: segmentEnd,
                label: segmentLabel.trim(),
                lines
            })
        } else {
            await addSegmentToVideo(groupId, videoId, {
                start: segmentStart,
                end: segmentEnd,
                label: segmentLabel.trim(),
                lines
            })
        }

        setIsCreatingSegment(false)
        setSegmentStart(null)
        setSegmentEnd(null)
        setSegmentLabel('')
        setStartTimeInput('')
        setEndTimeInput('')
        await loadData()
    }

    const handleDeleteSegment = async (segmentId: string) => {
        if (confirm('Delete this segment?')) {
            if (user) {
                await LibraryService.deleteSegment(groupId, videoId, segmentId)
            } else {
                await deleteSegment(groupId, videoId, segmentId)
            }
            setActiveSegmentIndex(null)
            await loadData()
        }
    }

    const activeSegment = video && activeSegmentIndex !== null ? video.segments[activeSegmentIndex] : null
    const segmentRecordings = recordings.filter(r => activeSegment && r.segmentId === activeSegment.id)
    const canRecord = recordAudio || recordVideo

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
            {/* Header */}
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
                <div className="space-y-6">
                    {/* Top Row: Video (left) + Toggle Panel (right) - Same size */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Video Player */}
                        <div className="bg-card rounded-lg border border-border/50 p-4">
                            <div className="aspect-video bg-black rounded overflow-hidden">
                                <div id="youtube-player" className="w-full h-full" />
                            </div>

                            {/* Segment Progress Bar */}
                            {activeSegment && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                        <span>{formatTime(activeSegment.start)}</span>
                                        <span className="font-medium text-foreground">{activeSegment.label}</span>
                                        <span>{formatTime(activeSegment.end)}</span>
                                    </div>
                                    <div
                                        ref={progressBarRef}
                                        className="h-3 bg-secondary rounded-full overflow-hidden cursor-pointer hover:h-4 transition-all"
                                        onClick={handleProgressClick}
                                    >
                                        <div
                                            className="h-full bg-primary transition-all duration-100"
                                            style={{
                                                width: `${Math.min(100, Math.max(0, ((currentTime - activeSegment.start) / (activeSegment.end - activeSegment.start)) * 100))}%`
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-center text-muted-foreground mt-1">
                                        Click bar to jump • {formatTime(currentTime)}
                                    </p>
                                </div>
                            )}

                            {/* Playback Controls */}
                            <div className="flex items-center justify-center gap-4 mt-4">
                                {activeSegment ? (
                                    <>
                                        <Button variant="outline" size="sm" onClick={exitSegmentMode}>Full Video</Button>
                                        <Button variant="outline" size="icon" onClick={handlePrevSegment} disabled={activeSegmentIndex === 0}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={handleReplay}>
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                        <Button variant={isLooping ? "default" : "outline"} size="icon" onClick={() => setIsLooping(!isLooping)}>
                                            <Repeat className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={handleNextSegment} disabled={activeSegmentIndex === video.segments.length - 1}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Click a segment below to practice</p>
                                )}
                            </div>
                        </div>

                        {/* Right: Toggle Panel (Transcript / Record) - Same size as video */}
                        <div className="bg-card rounded-lg border border-border/50 overflow-hidden flex flex-col">
                            {/* Toggle Header */}
                            <div className="flex border-b border-border/50">
                                <button
                                    className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${panelMode === 'transcript' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'}`}
                                    onClick={() => setPanelMode('transcript')}
                                >
                                    <FileText className="h-4 w-4" />
                                    Transcript
                                </button>
                                <button
                                    className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${panelMode === 'record' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'}`}
                                    onClick={() => setPanelMode('record')}
                                >
                                    <Mic className="h-4 w-4" />
                                    Record
                                </button>
                            </div>

                            {/* Panel Content */}
                            <div className="flex-1 p-4 overflow-auto">
                                {panelMode === 'transcript' ? (
                                    /* Transcript Mode */
                                    <div className="h-full flex flex-col">
                                        {video && video.transcript.length > 0 ? (
                                            <div
                                                ref={transcriptContainerRef}
                                                className="flex-1 overflow-y-auto space-y-4 px-2 scroll-smooth"
                                            >
                                                {video.transcript.map((line, index) => {
                                                    const isActive = currentTime >= line.start && currentTime < (line.start + line.duration + 0.5); // Add buffer
                                                    // Auto-scroll logic
                                                    if (isActive && transcriptContainerRef.current) {
                                                        // Simple auto-scroll: ensure the active element is visible
                                                        // We can use a ref callback or just document.getElementById if we gave IDs.
                                                        // Better: Find this element in the DOM.
                                                        // Let's use a subtle approach: render valid ID.
                                                    }

                                                    return (
                                                        <div
                                                            key={index}
                                                            id={`transcript-line-${index}`}
                                                            className={`p-3 rounded-lg transition-all duration-300 cursor-pointer ${isActive
                                                                ? 'bg-primary/10 scale-105 border-l-4 border-primary shadow-sm'
                                                                : 'hover:bg-secondary/50 text-muted-foreground'
                                                                }`}
                                                            onClick={() => playerRef.current?.seekTo(line.start, true)}
                                                        >
                                                            <p className={`text-lg leading-relaxed ${isActive ? 'font-medium text-foreground' : ''}`}>
                                                                {line.text}
                                                            </p>
                                                            <span className="text-xs text-muted-foreground opacity-50 block mt-1">
                                                                {formatTime(line.start)}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                                {/* Auto-scroll effect */}
                                                <ScrollToActiveLine containerRef={transcriptContainerRef} currentIndex={video.transcript.findIndex(l => currentTime >= l.start && currentTime < (l.start + l.duration + 0.5))} />
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 text-center p-6">
                                                <FileText className="h-12 w-12 opacity-20" />
                                                <div>
                                                    <p className="font-medium">No transcript available</p>
                                                    <p className="text-sm">Try removing and re-adding this video to fetch the transcript.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Record Mode */
                                    <div className="space-y-4">
                                        {!activeSegment ? (
                                            <div className="h-full flex items-center justify-center text-muted-foreground aspect-video">
                                                <p>Select a segment to start recording</p>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Audio/Video Checkboxes */}
                                                <div className="flex items-center justify-center gap-6">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={recordAudio}
                                                            onCheckedChange={(checked) => setRecordAudio(!!checked)}
                                                            disabled={isRecording}
                                                        />
                                                        <Mic className="h-4 w-4" />
                                                        <span className="text-sm">Audio</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={recordVideo}
                                                            onCheckedChange={(checked) => setRecordVideo(!!checked)}
                                                            disabled={isRecording}
                                                        />
                                                        <Video className="h-4 w-4" />
                                                        <span className="text-sm">Video</span>
                                                    </label>
                                                </div>

                                                {/* Live Camera Preview / Recording Preview */}
                                                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                                                    {countdown !== null && (
                                                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                                                            <span className="text-6xl font-bold animate-pulse text-white">{countdown}</span>
                                                        </div>
                                                    )}

                                                    {previewUrl ? (
                                                        /* Playback after recording */
                                                        recordVideo ? (
                                                            <video
                                                                ref={playbackVideoRef}
                                                                src={previewUrl}
                                                                controls
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <audio ref={playbackAudioRef} src={previewUrl} controls className="w-4/5" />
                                                            </div>
                                                        )
                                                    ) : recordVideo ? (
                                                        /* Live camera preview */
                                                        <video
                                                            ref={liveVideoRef}
                                                            className="w-full h-full object-cover"
                                                            muted
                                                            playsInline
                                                        />
                                                    ) : (
                                                        /* Audio only - no preview */
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                            <div className="text-center">
                                                                <Mic className="h-16 w-16 mx-auto mb-2 opacity-50" />
                                                                <p>Audio Only Mode</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Recording indicator */}
                                                    {isRecording && countdown === null && (
                                                        <div className="absolute top-3 left-3 flex items-center gap-2 bg-destructive text-destructive-foreground px-2 py-1 rounded">
                                                            <Circle className="h-3 w-3 fill-current animate-pulse" />
                                                            <span className="font-mono text-sm">{formatTime(recordingTime)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Controls */}
                                                <div className="flex items-center justify-center gap-3">
                                                    {!isRecording && !previewUrl && (
                                                        <Button
                                                            size="lg"
                                                            onClick={startRecording}
                                                            disabled={!canRecord}
                                                            className="gap-2"
                                                        >
                                                            <Circle className="h-5 w-5" />
                                                            Record
                                                        </Button>
                                                    )}

                                                    {isRecording && (
                                                        <Button size="lg" variant="destructive" onClick={stopRecording} className="gap-2">
                                                            <Square className="h-5 w-5" />
                                                            Stop
                                                        </Button>
                                                    )}

                                                    {previewUrl && (
                                                        <>
                                                            <Button variant="outline" onClick={discardRecording} className="gap-2">
                                                                <RotateCcw className="h-4 w-4" />
                                                                Retry
                                                            </Button>
                                                            <Button onClick={saveRecording} className="gap-2">
                                                                Save
                                                            </Button>
                                                            <Button variant="outline" onClick={downloadRecording} className="gap-2">
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>

                                                {!canRecord && (
                                                    <p className="text-xs text-center text-destructive">
                                                        Select at least Audio or Video to record
                                                    </p>
                                                )}

                                                {/* Saved Recordings for this segment */}
                                                {segmentRecordings.length > 0 && (
                                                    <div className="border-t border-border/50 pt-4 mt-4">
                                                        <h4 className="text-sm font-medium mb-2">Your Recordings ({segmentRecordings.length})</h4>
                                                        <div className="space-y-2">
                                                            {segmentRecordings.map((rec, idx) => (
                                                                <div key={rec.id} className="flex items-center gap-2 p-2 bg-secondary/30 rounded">
                                                                    <span className="text-sm font-medium">Take {idx + 1}</span>
                                                                    <span className="text-xs px-1.5 bg-secondary rounded">
                                                                        {rec.hasVideo ? 'Video' : 'Audio'}
                                                                    </span>
                                                                    <div className="flex-1" />
                                                                    <Button size="sm" variant="outline" onClick={() => playSyncRecording(rec)} className="gap-1">
                                                                        <Play className="h-3 w-3" />
                                                                        Sync
                                                                    </Button>
                                                                    <Button size="sm" variant="ghost" onClick={() => playOnlyRecording(rec)}>
                                                                        Play Mine
                                                                    </Button>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteRecording(rec.id)}>
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Segment List */}
                    <Card>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium">Segments ({video.segments.length})</CardTitle>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Current: {formatTime(currentTime)}</span>
                                <Dialog open={isCreatingSegment} onOpenChange={setIsCreatingSegment}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            <Plus className="h-4 w-4 mr-1" />
                                            New Segment
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create Segment</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="bg-secondary/50 p-3 rounded-lg text-center">
                                                <p className="text-xs text-muted-foreground mb-1">Current Video Time</p>
                                                <p className="text-2xl font-mono font-bold">{formatTime(currentTime)}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-2 block">Label</label>
                                                <Input
                                                    placeholder="e.g., Key phrase..."
                                                    value={segmentLabel}
                                                    onChange={(e) => setSegmentLabel(e.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium mb-2 block">Start</label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={startTimeInput}
                                                            onChange={(e) => {
                                                                setStartTimeInput(e.target.value)
                                                                const parsed = parseTime(e.target.value)
                                                                if (parsed !== null) setSegmentStart(parsed)
                                                            }}
                                                            placeholder="0:00"
                                                            className={segmentStart !== null ? 'bg-primary/10 border-primary' : ''}
                                                        />
                                                        <Button variant="outline" size="icon" onClick={() => {
                                                            setSegmentStart(currentTime)
                                                            setStartTimeInput(formatTime(currentTime))
                                                        }}>
                                                            <Clock className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium mb-2 block">End</label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={endTimeInput}
                                                            onChange={(e) => {
                                                                setEndTimeInput(e.target.value)
                                                                const parsed = parseTime(e.target.value)
                                                                if (parsed !== null) setSegmentEnd(parsed)
                                                            }}
                                                            placeholder="0:00"
                                                            className={segmentEnd !== null ? 'bg-primary/10 border-primary' : ''}
                                                        />
                                                        <Button variant="outline" size="icon" onClick={() => {
                                                            setSegmentEnd(currentTime)
                                                            setEndTimeInput(formatTime(currentTime))
                                                        }}>
                                                            <Clock className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsCreatingSegment(false)}>Cancel</Button>
                                            <Button onClick={handleCreateSegment} disabled={segmentStart === null || segmentEnd === null || !segmentLabel.trim()}>
                                                Create
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {video.segments.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No segments yet. Create your first segment to start practicing.
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {video.segments.map((segment, index) => (
                                        <div
                                            key={segment.id}
                                            className={`group relative px-4 py-2 rounded-lg cursor-pointer transition-colors ${activeSegmentIndex === index
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary/50 hover:bg-secondary'
                                                }`}
                                            onClick={() => playSegment(index)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{index + 1}.</span>
                                                <span>{segment.label}</span>
                                                <span className="text-xs opacity-70">({formatTime(segment.start)})</span>
                                            </div>
                                            <button
                                                className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteSegment(segment.id)
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Hidden audio element for audio-only playback */}
            <audio ref={playbackAudioRef} className="hidden" />
        </div>
    )
}
