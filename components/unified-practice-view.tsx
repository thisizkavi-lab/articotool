"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Repeat,
    Mic,
    Square,
    Loader2,
    Clock,
    Trash2,
    Circle,
    Play,
    FileText,
    StickyNote,
    Edit,
    Check,
    Camera,
    CameraOff,
    X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { BulkAddSegmentsForm } from '@/components/bulk-add-segments-form'
import { Textarea } from '@/components/ui/textarea'
import type { LibraryVideo, Recording } from '@/lib/types'

function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

function parseTimeInput(input: string): number | null {
    if (!input) return null
    const parts = input.split(':').map(Number)

    if (parts.some(Number.isNaN)) return null
    if (parts.length === 1) return parts[0]
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    return null
}

interface YTPlayer {
    playVideo: () => void
    pauseVideo: () => void
    seekTo: (seconds: number, allowSeekAhead: boolean) => void
    getCurrentTime: () => number
    destroy: () => void
    cueVideoById: (videoId: string) => void
}

interface UnifiedPracticeViewProps {
    video: LibraryVideo
    recordings: Recording[]
    onAddSegments: (segments: any[]) => Promise<void>
    onClearSegments: () => Promise<void>
    onDeleteSegment: (segmentId: string) => Promise<void>
    onSaveRecording: (recording: Recording) => Promise<void>
    onDeleteRecording: (recordingId: string) => Promise<void>
    onUpdateNotes?: (notes: string) => Promise<void>
    isLoading?: boolean
}

type CameraStatus = 'idle' | 'starting' | 'ready' | 'error'
type PreviewType = 'audio' | 'video' | null

export function UnifiedPracticeView({
    video,
    recordings,
    onAddSegments,
    onClearSegments,
    onDeleteSegment,
    onSaveRecording,
    onDeleteRecording,
    onUpdateNotes,
    isLoading = false,
}: UnifiedPracticeViewProps) {
    const [currentTime, setCurrentTime] = useState(0)
    const [isLooping, setIsLooping] = useState(true)
    const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null)
    const [isBulkAdding, setIsBulkAdding] = useState(false)
    const [isManualAdding, setIsManualAdding] = useState(false)
    const [manualSegment, setManualSegment] = useState({ start: '', end: '', label: '' })
    const [isBulkLoading, setIsBulkLoading] = useState(false)
    const [panelMode, setPanelMode] = useState<'record' | 'notes'>('record')
    const [isEditingNotes, setIsEditingNotes] = useState(false)
    const [notesText, setNotesText] = useState(video.notes || '')

    const [recordAudio, setRecordAudio] = useState(true)
    const [recordVideo, setRecordVideo] = useState(true)
    const [isRecording, setIsRecording] = useState(false)
    const [countdown, setCountdown] = useState<number | null>(null)
    const [recordingTime, setRecordingTime] = useState(0)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [previewType, setPreviewType] = useState<PreviewType>(null)
    const [previewIsUnsaved, setPreviewIsUnsaved] = useState(false)
    const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle')
    const [cameraError, setCameraError] = useState('')

    const playerRef = useRef<YTPlayer | null>(null)
    const playerReadyRef = useRef(false)
    const currentVideoIdRef = useRef<string | null>(null)
    const timeUpdateRef = useRef<NodeJS.Timeout | null>(null)
    const progressBarRef = useRef<HTMLDivElement>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const previewStreamRef = useRef<MediaStream | null>(null)
    const recordingStreamRef = useRef<MediaStream | null>(null)
    const liveVideoRef = useRef<HTMLVideoElement>(null)
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

    const stopPreviewCamera = useCallback(() => {
        if (previewStreamRef.current) {
            previewStreamRef.current.getTracks().forEach(track => track.stop())
            previewStreamRef.current = null
        }
        if (liveVideoRef.current) liveVideoRef.current.srcObject = null
        setCameraStatus('idle')
    }, [])

    const stopRecordingStream = useCallback(() => {
        if (recordingStreamRef.current) {
            recordingStreamRef.current.getTracks().forEach(track => track.stop())
            recordingStreamRef.current = null
        }
    }, [])

    const attachPreviewStream = useCallback(async (stream: MediaStream) => {
        if (!liveVideoRef.current) return
        if (liveVideoRef.current.srcObject !== stream) liveVideoRef.current.srcObject = stream
        await liveVideoRef.current.play().catch(() => { })
    }, [])

    const ensurePreviewCamera = useCallback(async (): Promise<MediaStream | null> => {
        const existing = previewStreamRef.current
        const existingTrack = existing?.getVideoTracks()[0]

        if (existing && existingTrack?.readyState === 'live') {
            await attachPreviewStream(existing)
            setCameraStatus('ready')
            return existing
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraStatus('error')
            setCameraError('Camera access is not available in this browser.')
            return null
        }

        setCameraStatus('starting')
        setCameraError('')

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            })

            previewStreamRef.current = stream
            await attachPreviewStream(stream)
            setCameraStatus('ready')
            return stream
        } catch (error) {
            console.error('Failed to start camera preview:', error)
            setCameraStatus('error')
            setCameraError('Camera permission is blocked. Allow camera access and try again.')
            return null
        }
    }, [attachPreviewStream])

    useEffect(() => {
        setNotesText(video.notes || '')
    }, [video.id, video.notes])

    useEffect(() => {
        if (panelMode !== 'record') {
            stopPreviewCamera()
            return
        }

        let active = true
        ensurePreviewCamera().then(stream => {
            if (!active && stream) stopPreviewCamera()
        })

        return () => {
            active = false
            stopPreviewCamera()
        }
    }, [panelMode, video.id, ensurePreviewCamera, stopPreviewCamera])

    useEffect(() => {
        return () => {
            stopPreviewCamera()
            stopRecordingStream()
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
        }
    }, [stopPreviewCamera, stopRecordingStream])

    useEffect(() => {
        if (!video.id) return

        const containerId = 'youtube-player-container'
        let timeoutId: NodeJS.Timeout | undefined
        let cancelled = false

        const initPlayer = () => {
            if (cancelled || !window.YT?.Player) return false
            const container = document.getElementById(containerId)
            if (!container) return false

            const existingIframe = container.querySelector('iframe')

            if (playerRef.current && playerReadyRef.current && existingIframe) {
                if (currentVideoIdRef.current !== video.id) {
                    playerRef.current.cueVideoById(video.id)
                    currentVideoIdRef.current = video.id
                }
                return true
            }

            if (playerRef.current && !existingIframe) {
                try { playerRef.current.destroy() } catch { }
                playerRef.current = null
                playerReadyRef.current = false
            }

            // @ts-ignore YouTube iframe API is loaded globally.
            playerRef.current = new window.YT.Player(containerId, {
                videoId: video.id,
                width: '100%',
                height: '100%',
                playerVars: { autoplay: 0, controls: 1, modestbranding: 1, rel: 0 },
                events: {
                    onReady: () => {
                        playerReadyRef.current = true
                        currentVideoIdRef.current = video.id
                    },
                    onError: (event: any) => console.error('[YT] player error:', event.data),
                },
            })
            return true
        }

        const tryInit = (attempt = 0) => {
            if (initPlayer()) return
            if (attempt < 24) timeoutId = setTimeout(() => tryInit(attempt + 1), 100)
        }

        if (!window.YT) {
            const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
            if (!existingScript) {
                const tag = document.createElement('script')
                tag.src = 'https://www.youtube.com/iframe_api'
                document.head.appendChild(tag)
            }
            const previousReady = window.onYouTubeIframeAPIReady
            window.onYouTubeIframeAPIReady = () => {
                if (typeof previousReady === 'function') previousReady()
                tryInit()
            }
        } else {
            tryInit()
        }

        return () => {
            cancelled = true
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [video.id])

    useEffect(() => {
        timeUpdateRef.current = setInterval(() => {
            if (!playerRef.current || !playerReadyRef.current) return

            try {
                const time = playerRef.current.getCurrentTime()
                setCurrentTime(time)

                if (isLooping && activeSegmentIndex !== null) {
                    const segment = video.segments[activeSegmentIndex]
                    if (segment && time >= segment.end) {
                        playerRef.current.seekTo(segment.start, true)
                        playerRef.current.playVideo()
                    }
                }
            } catch { }
        }, 100)

        return () => {
            if (timeUpdateRef.current) clearInterval(timeUpdateRef.current)
        }
    }, [isLooping, activeSegmentIndex, video.segments])

    const playSegment = (index: number) => {
        const segment = video.segments[index]
        if (!segment) return

        setActiveSegmentIndex(index)
        setPreviewUrl(null)
        setPreviewType(null)
        setPreviewIsUnsaved(false)
        setIsLooping(true)

        if (playerRef.current && playerReadyRef.current) {
            playerRef.current.seekTo(segment.start, true)
            playerRef.current.playVideo()
        }
    }

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        }
        setIsRecording(false)
        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current)
            recordingTimerRef.current = null
        }
    }, [])

    const startRecording = async () => {
        if (activeSegmentIndex === null || (!recordAudio && !recordVideo)) return

        const pendingTracks: MediaStreamTrack[] = []

        try {
            setPreviewUrl(null)
            setPreviewType(null)
            setPreviewIsUnsaved(false)

            if (recordVideo) {
                const previewStream = await ensurePreviewCamera()
                const cameraTrack = previewStream?.getVideoTracks()[0]
                if (!cameraTrack) throw new Error('Camera is unavailable')
                pendingTracks.push(cameraTrack.clone())
            }

            if (recordAudio) {
                const audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                })
                pendingTracks.push(...audioStream.getAudioTracks())
            }

            const recordingStream = new MediaStream(pendingTracks)
            recordingStreamRef.current = recordingStream

            setCountdown(3)
            await new Promise(resolve => setTimeout(resolve, 1000))
            setCountdown(2)
            await new Promise(resolve => setTimeout(resolve, 1000))
            setCountdown(1)
            await new Promise(resolve => setTimeout(resolve, 1000))
            setCountdown(null)

            chunksRef.current = []
            let mimeType = recordVideo ? 'video/webm;codecs=vp9' : 'audio/webm;codecs=opus'
            if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = recordVideo ? 'video/webm;codecs=vp8' : 'audio/webm'
            if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = recordVideo ? 'video/webm' : 'audio/webm'

            const mediaRecorder = new MediaRecorder(recordingStream, { mimeType })
            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) chunksRef.current.push(event.data)
            }
            mediaRecorder.onstop = () => {
                if (chunksRef.current.length > 0) {
                    const blob = new Blob(chunksRef.current, { type: mimeType })
                    setPreviewUrl(URL.createObjectURL(blob))
                    setPreviewType(recordVideo ? 'video' : 'audio')
                    setPreviewIsUnsaved(true)
                }
                stopRecordingStream()
                setIsRecording(false)
            }

            mediaRecorderRef.current = mediaRecorder
            mediaRecorder.start(100)
            setIsRecording(true)
            setRecordingTime(0)

            const segment = video.segments[activeSegmentIndex]
            if (segment && playerRef.current) {
                playerRef.current.seekTo(segment.start, true)
                playerRef.current.playVideo()
            }

            recordingTimerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000)
        } catch (error) {
            console.error('Failed to start recording:', error)
            setCountdown(null)
            pendingTracks.forEach(track => track.stop())
            stopRecordingStream()
        }
    }

    const activeSegment = activeSegmentIndex !== null ? video.segments[activeSegmentIndex] : null
    const segmentRecordings = recordings.filter(recording => activeSegment && recording.segmentId === activeSegment.id)

    if (isLoading) {
        return <div className="min-h-[400px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 items-stretch">
                <Card className="p-4 border-border/50 bg-card">
                    <div className="flex items-center justify-between mb-2 gap-3">
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm truncate">{video.title}</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Watch · imitate · repeat</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Button variant="ghost" size="sm" onClick={onClearSegments} className="text-destructive h-7 text-xs px-2" disabled={!video.segments.length}>
                                <Trash2 className="h-3 w-3 mr-1" /> Clear
                            </Button>

                            <Dialog open={isManualAdding} onOpenChange={setIsManualAdding}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                                        <Plus className="h-3 w-3 mr-1" /> Segment
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Add Segment</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Start</label>
                                                <Input placeholder="mm:ss" value={manualSegment.start} onChange={event => setManualSegment(prev => ({ ...prev, start: event.target.value }))} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">End</label>
                                                <Input placeholder="mm:ss" value={manualSegment.end} onChange={event => setManualSegment(prev => ({ ...prev, end: event.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Label</label>
                                            <Input placeholder="Optional" value={manualSegment.label} onChange={event => setManualSegment(prev => ({ ...prev, label: event.target.value }))} />
                                        </div>
                                        <Button onClick={async () => {
                                            const start = parseTimeInput(manualSegment.start)
                                            const end = parseTimeInput(manualSegment.end)
                                            if (start === null || end === null || end <= start) {
                                                alert('Invalid times. End must be after start.')
                                                return
                                            }
                                            await onAddSegments([{
                                                start,
                                                end,
                                                label: manualSegment.label || `Segment ${video.segments.length + 1}`,
                                                lines: [],
                                            }])
                                            setManualSegment({ start: '', end: '', label: '' })
                                            setIsManualAdding(false)
                                        }} disabled={!manualSegment.start || !manualSegment.end}>
                                            Add Segment
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={isBulkAdding} onOpenChange={setIsBulkAdding}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                                        <FileText className="h-3 w-3 mr-1" /> Bulk
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader><DialogTitle>Bulk Add Segments</DialogTitle></DialogHeader>
                                    <BulkAddSegmentsForm
                                        onAdd={async segments => {
                                            setIsBulkLoading(true)
                                            try {
                                                await onAddSegments(segments)
                                                setIsBulkAdding(false)
                                            } finally {
                                                setIsBulkLoading(false)
                                            }
                                        }}
                                        isLoading={isBulkLoading}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="bg-black rounded-lg overflow-hidden aspect-video">
                        <div id="youtube-player-container" className="w-full h-full" />
                    </div>

                    {activeSegment && (
                        <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5 gap-3">
                                <span className="tabular-nums">{formatTime(activeSegment.start)}</span>
                                <span className="font-medium text-foreground truncate">{activeSegment.label}</span>
                                <span className="tabular-nums">{formatTime(activeSegment.end)}</span>
                            </div>
                            <div
                                ref={progressBarRef}
                                className="h-2.5 bg-secondary rounded-full overflow-hidden cursor-pointer"
                                onClick={event => {
                                    if (!progressBarRef.current || !playerRef.current) return
                                    const rect = progressBarRef.current.getBoundingClientRect()
                                    const percent = (event.clientX - rect.left) / rect.width
                                    playerRef.current.seekTo(activeSegment.start + (activeSegment.end - activeSegment.start) * percent, true)
                                }}
                            >
                                <div
                                    className="h-full bg-primary transition-all duration-100"
                                    style={{ width: `${Math.min(100, Math.max(0, ((currentTime - activeSegment.start) / (activeSegment.end - activeSegment.start)) * 100))}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-3 mt-4">
                        {activeSegment ? (
                            <>
                                <Button variant="outline" size="sm" onClick={() => setActiveSegmentIndex(null)}>Full Video</Button>
                                <Button variant="outline" size="icon" onClick={() => activeSegmentIndex !== null && activeSegmentIndex > 0 && playSegment(activeSegmentIndex - 1)} disabled={activeSegmentIndex === 0}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => activeSegmentIndex !== null && playSegment(activeSegmentIndex)}>
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                                <Button variant={isLooping ? 'default' : 'outline'} size="icon" onClick={() => setIsLooping(prev => !prev)}>
                                    <Repeat className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => activeSegmentIndex !== null && activeSegmentIndex < video.segments.length - 1 && playSegment(activeSegmentIndex + 1)} disabled={activeSegmentIndex === video.segments.length - 1}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">Choose a segment below to start shadowing.</p>
                        )}
                    </div>
                </Card>

                <Card className="overflow-hidden flex flex-col border-border/50 bg-card min-h-[430px]">
                    <div className="grid grid-cols-2 border-b border-border/50">
                        <button
                            className={`py-3 text-sm font-medium flex items-center justify-center gap-2 ${panelMode === 'record' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'}`}
                            onClick={() => setPanelMode('record')}
                        >
                            <Mic className="h-4 w-4" /> Record
                        </button>
                        <button
                            className={`py-3 text-sm font-medium flex items-center justify-center gap-2 ${panelMode === 'notes' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'}`}
                            onClick={() => setPanelMode('notes')}
                        >
                            <StickyNote className="h-4 w-4" /> Notes
                        </button>
                    </div>

                    <div className="flex-1 p-4 min-h-0">
                        {panelMode === 'notes' ? (
                            <div className="h-full flex flex-col space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-semibold">Practice notes</h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">Write what you notice about pace, pauses, emphasis, or delivery.</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={async () => {
                                        if (isEditingNotes && onUpdateNotes) await onUpdateNotes(notesText)
                                        setIsEditingNotes(prev => !prev)
                                    }}>
                                        {isEditingNotes ? <Check className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                                        {isEditingNotes ? 'Save' : 'Edit'}
                                    </Button>
                                </div>
                                {isEditingNotes ? (
                                    <Textarea
                                        className="flex-1 min-h-[300px] bg-secondary/20 border-none focus-visible:ring-1 focus-visible:ring-primary/30 resize-none"
                                        placeholder="What should you imitate on the next take?"
                                        value={notesText}
                                        onChange={event => setNotesText(event.target.value)}
                                    />
                                ) : (
                                    <div className="flex-1 whitespace-pre-wrap text-sm text-muted-foreground bg-secondary/10 p-4 rounded-lg overflow-auto">
                                        {notesText || 'No notes yet.'}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col space-y-3">
                                <div className="shrink-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold truncate">
                                                {activeSegment ? activeSegment.label : 'Mirror preview'}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {activeSegment
                                                    ? `${formatTime(activeSegment.start)} – ${formatTime(activeSegment.end)}`
                                                    : 'Choose a segment when you are ready to record.'}
                                            </p>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border/60 rounded-full px-2 py-1 shrink-0">
                                            Mirrored
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-center gap-6 shrink-0">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox checked={recordAudio} onCheckedChange={value => setRecordAudio(!!value)} disabled={isRecording} />
                                        <span className="text-xs font-medium uppercase tracking-wider">Audio</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox checked={recordVideo} onCheckedChange={value => setRecordVideo(!!value)} disabled={isRecording} />
                                        <span className="text-xs font-medium uppercase tracking-wider">Video</span>
                                    </label>
                                </div>

                                <div className="flex-1 min-h-[250px] bg-black rounded-lg relative overflow-hidden flex items-center justify-center">
                                    <video
                                        ref={liveVideoRef}
                                        className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] transition-opacity duration-200 ${cameraStatus === 'ready' ? 'opacity-100' : 'opacity-0'}`}
                                        muted
                                        playsInline
                                    />

                                    {cameraStatus === 'starting' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                                            <Loader2 className="h-7 w-7 animate-spin mb-2" />
                                            <span className="text-xs">Starting camera…</span>
                                        </div>
                                    )}

                                    {cameraStatus === 'error' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-black">
                                            <CameraOff className="h-9 w-9 text-white/45 mb-3" />
                                            <p className="text-sm text-white/80">Camera unavailable</p>
                                            <p className="text-xs text-white/45 mt-1 max-w-xs">{cameraError}</p>
                                            <Button size="sm" variant="secondary" className="mt-4" onClick={() => ensurePreviewCamera()}>
                                                <Camera className="h-4 w-4 mr-2" /> Enable Camera
                                            </Button>
                                        </div>
                                    )}

                                    {cameraStatus === 'ready' && !previewUrl && (
                                        <div className="absolute top-2 right-2 bg-black/55 backdrop-blur px-2 py-1 rounded text-[10px] text-white/70 uppercase tracking-wider">
                                            Mirror
                                        </div>
                                    )}

                                    {previewUrl && (
                                        <div className="absolute inset-0 z-10 bg-black flex items-center justify-center">
                                            {previewType === 'video' ? (
                                                <video
                                                    src={previewUrl}
                                                    controls
                                                    autoPlay
                                                    className="w-full h-full object-contain scale-x-[-1]"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                                    <Mic className="h-10 w-10 text-white/40" />
                                                    <audio src={previewUrl} controls autoPlay className="w-[88%]" />
                                                </div>
                                            )}
                                            <button
                                                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/65 text-white/80 flex items-center justify-center hover:bg-black/80"
                                                onClick={() => {
                                                    setPreviewUrl(null)
                                                    setPreviewType(null)
                                                    setPreviewIsUnsaved(false)
                                                }}
                                                aria-label="Close take preview"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}

                                    {countdown !== null && (
                                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 text-6xl font-bold text-white">
                                            {countdown}
                                        </div>
                                    )}

                                    {isRecording && (
                                        <div className="absolute top-2 left-2 z-30 bg-destructive text-white px-2 py-1 rounded text-xs font-mono flex items-center gap-1.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                            {formatTime(recordingTime)}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-center gap-3 shrink-0">
                                    {!isRecording && !previewUrl && (
                                        <Button
                                            onClick={startRecording}
                                            disabled={!activeSegment || (!recordAudio && !recordVideo)}
                                            className="rounded-full px-6"
                                        >
                                            <Circle className="h-4 w-4 mr-2" /> Record Take
                                        </Button>
                                    )}

                                    {isRecording && (
                                        <Button variant="destructive" onClick={stopRecording} className="rounded-full px-6">
                                            <Square className="h-4 w-4 mr-2" /> Stop
                                        </Button>
                                    )}

                                    {previewUrl && previewIsUnsaved && (
                                        <>
                                            <Button variant="outline" onClick={() => {
                                                setPreviewUrl(null)
                                                setPreviewType(null)
                                                setPreviewIsUnsaved(false)
                                            }}>
                                                <RotateCcw className="h-4 w-4 mr-2" /> Retry
                                            </Button>
                                            <Button onClick={async () => {
                                                if (!activeSegment || !previewType) return
                                                await onSaveRecording({
                                                    id: `rec-${Date.now()}`,
                                                    segmentId: activeSegment.id,
                                                    blobUrl: previewUrl,
                                                    type: previewType,
                                                    createdAt: Date.now(),
                                                })
                                                setPreviewIsUnsaved(false)
                                            }}>
                                                Save Take
                                            </Button>
                                        </>
                                    )}
                                </div>

                                {!activeSegment && (
                                    <p className="text-xs text-center text-muted-foreground">
                                        Your camera stays live here so you can watch your posture, expression, and delivery before recording.
                                    </p>
                                )}

                                {segmentRecordings.length > 0 && (
                                    <div className="pt-3 border-t border-border/50 shrink-0">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Saved takes</h4>
                                        <div className="space-y-1.5 max-h-[110px] overflow-y-auto">
                                            {segmentRecordings.map((recording, index) => (
                                                <div key={recording.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg text-xs">
                                                    <span>Take {index + 1} · {recording.type === 'video' ? 'video' : 'audio'}</span>
                                                    <div className="flex gap-1">
                                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                                                            setPreviewUrl(recording.blobUrl)
                                                            setPreviewType(recording.type)
                                                            setPreviewIsUnsaved(false)
                                                        }}>
                                                            <Play className="h-3 w-3" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDeleteRecording(recording.id)}>
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Segments <span className="text-muted-foreground font-normal">({video.segments.length})</span></h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">Click a card to loop that exact moment.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {video.segments.map((segment, index) => (
                        <Card
                            key={segment.id}
                            className={`p-3.5 cursor-pointer transition-all hover:border-primary/50 ${activeSegmentIndex === index ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-border/50'}`}
                            onClick={() => playSegment(index)}
                        >
                            <div className="flex justify-between items-start gap-3 mb-2">
                                <span className="font-medium text-sm line-clamp-2">{segment.label}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                                    onClick={event => {
                                        event.stopPropagation()
                                        onDeleteSegment(segment.id)
                                    }}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
                                <Clock className="h-3 w-3" /> {formatTime(segment.start)} – {formatTime(segment.end)}
                                <span>·</span>
                                <span>{Math.round(segment.end - segment.start)}s</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
