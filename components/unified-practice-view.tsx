"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, ChevronLeft, ChevronRight, RotateCcw, Repeat, Mic, Video, Square, Loader2, Clock, Trash2, Download, Circle, Play, FileText, StickyNote, Edit, Check } from 'lucide-react'
import { BulkAddSegmentsForm } from '@/components/bulk-add-segments-form'
import { ScrollToActiveLine } from '@/components/ui/scroll-to-active'
import { Textarea } from '@/components/ui/textarea'
import type { LibraryVideo, LibrarySegment, TranscriptLine, Recording } from '@/lib/types'

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

interface YTPlayer {
    playVideo: () => void
    pauseVideo: () => void
    seekTo: (seconds: number, allowSeekAhead: boolean) => void
    getCurrentTime: () => number
    getPlayerState: () => number
    destroy: () => void
}

interface UnifiedPracticeViewProps {
    video: LibraryVideo
    recordings: Recording[]
    onAddSegments: (segments: any[], replaceTranscript?: boolean) => Promise<void>
    onClearSegments: () => Promise<void>
    onDeleteSegment: (segmentId: string) => Promise<void>
    onSaveRecording: (recording: Recording) => Promise<void>
    onDeleteRecording: (recordingId: string) => Promise<void>
    onUpdateNotes?: (notes: string) => Promise<void>
    onUpdateTranscript?: (transcript: TranscriptLine[]) => Promise<void>
    isLoading?: boolean
}

export function UnifiedPracticeView({
    video,
    recordings,
    onAddSegments,
    onClearSegments,
    onDeleteSegment,
    onSaveRecording,
    onDeleteRecording,
    onUpdateNotes,
    onUpdateTranscript,
    isLoading = false
}: UnifiedPracticeViewProps) {
    const [currentTime, setCurrentTime] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLooping, setIsLooping] = useState(true)
    const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null)
    const [isBulkAdding, setIsBulkAdding] = useState(false)
    const [isBulkLoading, setIsBulkLoading] = useState(false)
    const [panelMode, setPanelMode] = useState<'transcript' | 'record' | 'notes'>('transcript')
    const [isEditingNotes, setIsEditingNotes] = useState(false)
    const [notesText, setNotesText] = useState(video.notes || '')
    const [isPastingTranscript, setIsPastingTranscript] = useState(false)
    const [rawTranscript, setRawTranscript] = useState('')

    // Recording state
    const [recordAudio, setRecordAudio] = useState(true)
    const [recordVideo, setRecordVideo] = useState(true)
    const [isRecording, setIsRecording] = useState(false)
    const [countdown, setCountdown] = useState<number | null>(null)
    const [recordingTime, setRecordingTime] = useState(0)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
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

    const stopAllStreams = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        if (liveVideoRef.current && liveVideoRef.current.srcObject) {
            const stream = liveVideoRef.current.srcObject as MediaStream
            stream.getTracks().forEach(track => track.stop())
            liveVideoRef.current.srcObject = null
        }
    }, [])

    // Manage media stream lifecycle
    useEffect(() => {
        let cancelled = false
        const setupStream = async () => {
            const shouldBeActive = panelMode === 'record' && !isRecording && !previewUrl && (recordVideo || recordAudio) && activeSegmentIndex !== null

            if (shouldBeActive) {
                if (streamRef.current) return // Already active

                try {
                    const constraints = {
                        video: recordVideo ? { facingMode: 'user', width: 640, height: 480 } : false,
                        audio: recordAudio
                    }
                    const stream = await navigator.mediaDevices.getUserMedia(constraints)
                    if (cancelled) {
                        stream.getTracks().forEach(track => track.stop())
                        return
                    }
                    streamRef.current = stream
                    if (liveVideoRef.current && recordVideo) {
                        liveVideoRef.current.srcObject = stream
                        liveVideoRef.current.play().catch(() => { })
                    }
                } catch (err) {
                    console.error('Failed to start media stream:', err)
                }
            } else {
                stopAllStreams()
            }
        }
        setupStream()
        return () => {
            cancelled = true
            stopAllStreams()
        }
    }, [panelMode, isRecording, previewUrl, recordVideo, recordAudio, activeSegmentIndex, stopAllStreams])

    // YouTube integration
    useEffect(() => {
        if (!video) return
        const initPlayer = () => {
            if (playerRef.current) playerRef.current.destroy()
            playerRef.current = new window.YT.Player('youtube-player', {
                videoId: video.id,
                playerVars: { autoplay: 0, controls: 1, modestbranding: 1, rel: 0 },
                events: {
                    onReady: () => { playerReadyRef.current = true },
                    onStateChange: (event: any) => { setIsPlaying(event.data === window.YT.PlayerState.PLAYING) },
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
    }, [video.id])

    // Time update loop
    useEffect(() => {
        timeUpdateRef.current = setInterval(() => {
            if (playerRef.current && playerReadyRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                try {
                    const time = playerRef.current.getCurrentTime()
                    setCurrentTime(time)
                    if (isLooping && activeSegmentIndex !== null) {
                        const segment = video.segments[activeSegmentIndex]
                        if (segment && time >= segment.end) {
                            playerRef.current.seekTo(segment.start, true)
                        }
                    }
                } catch { }
            }
        }, 100)
        return () => { if (timeUpdateRef.current) clearInterval(timeUpdateRef.current) }
    }, [isLooping, activeSegmentIndex, video.segments])

    const playSegment = (index: number) => {
        if (!playerRef.current || !playerReadyRef.current) return
        const segment = video.segments[index]
        if (!segment) return
        setActiveSegmentIndex(index)
        setIsLooping(true)
        playerRef.current.seekTo(segment.start, true)
        playerRef.current.playVideo()
    }

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
        }
    }, [isRecording])

    const startRecording = async () => {
        if (activeSegmentIndex === null || (!recordAudio && !recordVideo)) return
        setCountdown(3)
        for (let i = 2; i >= 0; i--) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            setCountdown(i === 0 ? null : i)
        }
        try {
            let stream = streamRef.current
            if (!stream) {
                const constraints = {
                    video: recordVideo ? { facingMode: 'user', width: 640, height: 480 } : false,
                    audio: recordAudio
                }
                stream = await navigator.mediaDevices.getUserMedia(constraints)
                streamRef.current = stream
            }
            if (liveVideoRef.current && recordVideo) {
                liveVideoRef.current.srcObject = stream
                await liveVideoRef.current.play().catch(() => { })
            }
            chunksRef.current = []
            let mimeType = recordVideo ? 'video/webm;codecs=vp9' : 'audio/webm;codecs=opus'
            if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = recordVideo ? 'video/webm;codecs=vp8' : 'audio/webm'
            if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = recordVideo ? 'video/webm' : 'audio/webm'
            const mediaRecorder = new MediaRecorder(stream, { mimeType })
            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
            mediaRecorder.onstop = () => {
                if (chunksRef.current.length > 0) {
                    const blob = new Blob(chunksRef.current, { type: mimeType })
                    setPreviewUrl(URL.createObjectURL(blob))
                }
                stopAllStreams()
            }
            mediaRecorderRef.current = mediaRecorder
            mediaRecorder.start(100)
            setIsRecording(true)
            setRecordingTime(0)
            const activeSegment = video.segments[activeSegmentIndex]
            if (playerRef.current && activeSegment) {
                playerRef.current.seekTo(activeSegment.start, true)
                playerRef.current.playVideo()
            }
            recordingTimerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000)
        } catch (err) {
            console.error('Failed to start recording:', err)
            setCountdown(null)
        }
    }

    const activeSegment = activeSegmentIndex !== null ? video.segments[activeSegmentIndex] : null
    const segmentRecordings = recordings.filter(r => activeSegment && r.segmentId === activeSegment.id)

    if (isLoading) return <div className="min-h-[400px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Video */}
                <Card className="p-4 border-border/50 bg-card">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1 mr-2">
                            <h3 className="font-semibold text-sm truncate">{video.title}</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Practice Session</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={onClearSegments} className="text-destructive h-7 text-xs px-2" disabled={!video.segments.length}>
                                <Trash2 className="h-3 w-3 mr-1" /> Clear Segments
                            </Button>
                            <Dialog open={isBulkAdding} onOpenChange={setIsBulkAdding}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                                        <FileText className="h-3 w-3 mr-1" /> Bulk Add
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader><DialogTitle>Bulk Add Segments</DialogTitle></DialogHeader>
                                    <BulkAddSegmentsForm
                                        onAdd={async (segments) => {
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
                    <div className="aspect-video bg-black rounded overflow-hidden">
                        <div id="youtube-player" className="w-full h-full" />
                    </div>
                    {activeSegment && (
                        <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>{formatTime(activeSegment.start)}</span>
                                <span className="font-medium text-foreground">{activeSegment.label}</span>
                                <span>{formatTime(activeSegment.end)}</span>
                            </div>
                            <div ref={progressBarRef} className="h-3 bg-secondary rounded-full overflow-hidden cursor-pointer hover:h-4 transition-all"
                                onClick={(e) => {
                                    if (!activeSegment || !progressBarRef.current || !playerRef.current) return
                                    const rect = progressBarRef.current.getBoundingClientRect()
                                    const percent = (e.clientX - rect.left) / rect.width
                                    playerRef.current.seekTo(activeSegment.start + (activeSegment.end - activeSegment.start) * percent, true)
                                }}>
                                <div className="h-full bg-primary transition-all duration-100" style={{ width: `${Math.min(100, Math.max(0, ((currentTime - activeSegment.start) / (activeSegment.end - activeSegment.start)) * 100))}%` }} />
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-center gap-4 mt-4">
                        {activeSegment ? (
                            <>
                                <Button variant="outline" size="sm" onClick={() => setActiveSegmentIndex(null)}>Full Video</Button>
                                <Button variant="outline" size="icon" onClick={() => {
                                    if (activeSegmentIndex !== null && activeSegmentIndex > 0) playSegment(activeSegmentIndex - 1)
                                }} disabled={activeSegmentIndex === 0}><ChevronLeft className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" onClick={() => {
                                    if (activeSegmentIndex !== null) playSegment(activeSegmentIndex)
                                }}><RotateCcw className="h-4 w-4" /></Button>
                                <Button variant={isLooping ? "default" : "outline"} size="icon" onClick={() => setIsLooping(!isLooping)}><Repeat className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" onClick={() => {
                                    if (activeSegmentIndex !== null && activeSegmentIndex < video.segments.length - 1) playSegment(activeSegmentIndex + 1)
                                }} disabled={activeSegmentIndex === video.segments.length - 1}><ChevronRight className="h-4 w-4" /></Button>
                            </>
                        ) : <p className="text-sm text-muted-foreground">Select a segment below to practice</p>}
                    </div>
                </Card>

                {/* Right: Transcript/Record/Notes */}
                <Card className="overflow-hidden flex flex-col border-border/50 bg-card h-[400px] lg:h-[500px]">
                    <div className="flex border-b border-border/50">
                        <button className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${panelMode === 'transcript' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'}`} onClick={() => setPanelMode('transcript')}>
                            <FileText className="h-4 w-4" /> Transcript
                        </button>
                        <button className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${panelMode === 'record' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'}`} onClick={() => setPanelMode('record')}>
                            <Mic className="h-4 w-4" /> Record
                        </button>
                        <button className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${panelMode === 'notes' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'}`} onClick={() => setPanelMode('notes')}>
                            <StickyNote className="h-4 w-4" /> Notes
                        </button>
                    </div>
                    <div className="flex-1 p-4 overflow-auto min-h-0">
                        {panelMode === 'transcript' ? (
                            video.transcript.length > 0 ? (
                                <div className="h-full flex flex-col min-h-0">
                                    {/* Focus Area: Current & Next */}
                                    <div className="flex flex-col gap-2 mb-3 shrink-0">
                                        {(() => {
                                            const activeIdx = video.transcript.findIndex(l => currentTime >= l.start && currentTime < (l.start + l.duration + 0.5));
                                            const currentLine = activeIdx !== -1 ? video.transcript[activeIdx] : null;
                                            const nextLine = activeIdx !== -1 && activeIdx < video.transcript.length - 1 ? video.transcript[activeIdx + 1] : null;

                                            return (
                                                <>
                                                    {currentLine && (
                                                        <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg shadow-sm">
                                                            <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-tighter opacity-70">Now Playing</p>
                                                            <p className="text-base font-semibold leading-tight text-foreground">{currentLine.text}</p>
                                                        </div>
                                                    )}
                                                    {nextLine && (
                                                        <div className="p-2 bg-secondary/20 border border-border/50 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => playerRef.current?.seekTo(nextLine.start, true)}>
                                                            <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-tighter opacity-70">Up Next</p>
                                                            <p className="text-sm font-medium leading-tight">{nextLine.text}</p>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {/* Timeline: Scrollable & Clickable */}
                                    <div className="flex-1 flex flex-col min-h-0 border-t border-border/30 pt-3">
                                        <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-widest opacity-40 px-2">Timeline</p>
                                        <div ref={transcriptContainerRef} className="flex-1 overflow-y-auto space-y-1.5 px-2 scroll-smooth">
                                            {video.transcript.map((line, i) => {
                                                const isActive = currentTime >= line.start && currentTime < (line.start + line.duration + 0.5)
                                                return (
                                                    <div key={i} className={`p-1.5 rounded-md cursor-pointer transition-all ${isActive ? 'bg-primary/5 text-primary' : 'hover:bg-secondary/30 text-muted-foreground opacity-60'}`} onClick={() => playerRef.current?.seekTo(line.start, true)}>
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-[9px] font-mono opacity-40 mt-0.5 bg-secondary px-1 rounded shrink-0">{formatTime(line.start)}</span>
                                                            <p className={`text-xs leading-snug transition-colors ${isActive ? 'font-medium' : ''}`}>{line.text}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            <ScrollToActiveLine containerRef={transcriptContainerRef} currentIndex={video.transcript.findIndex(l => currentTime >= l.start && currentTime < (l.start + l.duration + 0.5))} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center space-y-4">
                                    <div className="text-center opacity-50">
                                        <FileText className="h-12 w-12 mx-auto mb-2" />
                                        <p>No transcript available</p>
                                    </div>
                                    {!isPastingTranscript ? (
                                        <Button variant="outline" size="sm" onClick={() => setIsPastingTranscript(true)}>
                                            <Plus className="h-4 w-4 mr-2" /> Add Manually
                                        </Button>
                                    ) : (
                                        <div className="w-full space-y-2">
                                            <Textarea
                                                placeholder="Paste your transcript here (each line will be a segment)..."
                                                className="min-h-[200px] text-sm"
                                                value={rawTranscript}
                                                onChange={(e) => setRawTranscript(e.target.value)}
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="ghost" size="sm" onClick={() => setIsPastingTranscript(false)}>Cancel</Button>
                                                <Button size="sm" onClick={async () => {
                                                    const lines: TranscriptLine[] = []
                                                    const rawLines = rawTranscript.split('\n').filter(l => l.trim())

                                                    // Enhanced parsing for (mm:ss) or [mm:ss]
                                                    rawLines.forEach((rawLine) => {
                                                        const timestampRegex = /(?:\(|\[)(\d{1,2}):(\d{2})(?:\)|\])/g
                                                        let match
                                                        let lastIndex = 0
                                                        let lineStartTime = lines.length > 0 ? lines[lines.length - 1].start + 5 : 0

                                                        // If line starts with a timestamp, use it
                                                        const startMatch = /^(?:\(|\[)(\d{1,2}):(\d{2})(?:\)|\])\s*(.*)/.exec(rawLine)
                                                        if (startMatch) {
                                                            const mins = parseInt(startMatch[1])
                                                            const secs = parseInt(startMatch[2])
                                                            const time = mins * 60 + secs
                                                            const text = startMatch[3].trim()
                                                            if (text) {
                                                                lines.push({ text, start: time, duration: 5 })
                                                                return
                                                            }
                                                        }

                                                        // Otherwise look for timestamps within the line
                                                        while ((match = timestampRegex.exec(rawLine)) !== null) {
                                                            const mins = parseInt(match[1])
                                                            const secs = parseInt(match[2])
                                                            const time = mins * 60 + secs

                                                            // Extract text between previous timestamp and current one
                                                            const textBefore = rawLine.substring(lastIndex, match.index).replace(/^[(\[]\d{1,2}:\d{2}[)\]]\s*/, '').trim()
                                                            if (textBefore && lines.length > 0) {
                                                                // Update the previous dummy line if it was empty, or just add
                                                                lines[lines.length - 1].duration = Math.max(1, time - lines[lines.length - 1].start)
                                                            }

                                                            lastIndex = timestampRegex.lastIndex
                                                            lineStartTime = time
                                                        }

                                                        const remainingText = rawLine.substring(lastIndex).trim()
                                                        if (remainingText) {
                                                            lines.push({
                                                                text: remainingText,
                                                                start: lineStartTime,
                                                                duration: 5
                                                            })
                                                        }
                                                    })

                                                    // Cleanup durations by looking ahead
                                                    for (let i = 0; i < lines.length - 1; i++) {
                                                        lines[i].duration = Math.max(1, lines[i + 1].start - lines[i].start)
                                                    }

                                                    if (onUpdateTranscript && lines.length > 0) {
                                                        await onUpdateTranscript(lines)
                                                        setIsPastingTranscript(false)
                                                        setRawTranscript('')
                                                    }
                                                }}>Save Transcript</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        ) : panelMode === 'notes' ? (
                            <div className="h-full flex flex-col space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Video Notes</h4>
                                    <Button variant="ghost" size="sm" onClick={async () => {
                                        if (isEditingNotes) {
                                            if (onUpdateNotes) await onUpdateNotes(notesText)
                                        }
                                        setIsEditingNotes(!isEditingNotes)
                                    }}>
                                        {isEditingNotes ? <Check className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                                        {isEditingNotes ? 'Save' : 'Edit'}
                                    </Button>
                                </div>
                                {isEditingNotes ? (
                                    <Textarea
                                        className="flex-1 min-h-[300px] bg-secondary/20 border-none focus-visible:ring-1 focus-visible:ring-primary/30 resize-none font-sans"
                                        placeholder="Write your observations, vocabulary, or tips here..."
                                        value={notesText}
                                        onChange={(e) => setNotesText(e.target.value)}
                                    />
                                ) : (
                                    <div className="flex-1 whitespace-pre-wrap text-sm text-muted-foreground bg-secondary/10 p-4 rounded-lg overflow-auto">
                                        {notesText || 'No notes yet. Click edit to add some!'}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col space-y-4">
                                {!activeSegment ? <div className="flex-1 flex items-center justify-center text-muted-foreground italic text-sm">Select a segment to record</div> : (
                                    <div className="flex-1 flex flex-col space-y-3 min-h-0">
                                        {/* Transcript Preview for Record Mode */}
                                        <div className="bg-secondary/20 p-3 rounded-lg border border-border/50 max-h-[120px] overflow-y-auto">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 opacity-50">Transcript</p>
                                            <div className="space-y-1.5">
                                                {video.transcript
                                                    .filter(l => l.start >= activeSegment.start - 1 && l.start < activeSegment.end + 1)
                                                    .map((line, i) => {
                                                        const isActive = currentTime >= line.start && currentTime < (line.start + line.duration + 0.5)
                                                        return (
                                                            <p key={i} className={`text-sm leading-snug ${isActive ? 'text-primary font-medium' : 'text-muted-foreground opacity-60'}`}>
                                                                {line.text}
                                                            </p>
                                                        )
                                                    })}
                                            </div>
                                        </div>

                                        <div className="flex justify-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={recordAudio} onCheckedChange={(v) => setRecordAudio(!!v)} disabled={isRecording} /><span className="text-xs font-medium uppercase tracking-wider">Audio</span></label>
                                            <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={recordVideo} onCheckedChange={(v) => setRecordVideo(!!v)} disabled={isRecording} /><span className="text-xs font-medium uppercase tracking-wider">Video</span></label>
                                        </div>
                                        <div className="aspect-video bg-black rounded relative overflow-hidden">
                                            {countdown !== null && <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 text-6xl font-bold text-white">{countdown}</div>}
                                            {previewUrl ? (recordVideo ? <video src={previewUrl} controls className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center"><audio src={previewUrl} controls /></div>) : recordVideo ? <video ref={liveVideoRef} className="w-full h-full object-cover" muted playsInline /> : <div className="h-full flex items-center justify-center text-muted-foreground opacity-50"><Mic className="h-12 w-12" /></div>}
                                            {isRecording && <div className="absolute top-2 left-2 bg-destructive text-white px-2 py-0.5 rounded text-xs font-mono flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />{formatTime(recordingTime)}</div>}
                                        </div>
                                        <div className="flex justify-center gap-3">
                                            {!isRecording && !previewUrl && <Button onClick={startRecording} disabled={!recordAudio && !recordVideo} className="rounded-full px-6"><Circle className="h-4 w-4 mr-2" /> Start Recording</Button>}
                                            {isRecording && <Button variant="destructive" onClick={stopRecording} className="rounded-full px-6"><Square className="h-4 w-4 mr-2" /> Stop</Button>}
                                            {previewUrl && (
                                                <>
                                                    <Button variant="outline" onClick={() => setPreviewUrl(null)}><RotateCcw className="h-4 w-4 mr-2" /> Retry</Button>
                                                    <Button onClick={() => {
                                                        onSaveRecording({ id: `rec-${Date.now()}`, segmentId: activeSegment.id, blobUrl: previewUrl, type: recordVideo ? 'video' : 'audio', createdAt: Date.now() })
                                                        setPreviewUrl(null)
                                                    }}>Save</Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {segmentRecordings.length > 0 && (
                                    <div className="pt-3 border-t border-border/50 shrink-0">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Takes</h4>
                                        <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                                            {segmentRecordings.map((rec, i) => (
                                                <div key={rec.id} className="flex items-center justify-between p-1.5 bg-secondary/30 rounded-lg text-xs">
                                                    <span>Take {i + 1} ({rec.type === 'video' ? 'V' : 'A'})</span>
                                                    <div className="flex gap-1">
                                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                                                            if (playbackVideoRef.current && rec.type === 'video') { playbackVideoRef.current.src = rec.blobUrl; playbackVideoRef.current.play() }
                                                            else if (playbackAudioRef.current) { playbackAudioRef.current.src = rec.blobUrl; playbackAudioRef.current.play() }
                                                        }}><Play className="h-3 w-3" /></Button>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => onDeleteRecording(rec.id)}><Trash2 className="h-3 w-3" /></Button>
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

            {/* Segments Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Segments ({video.segments.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {video.segments.map((s, i) => (
                        <Card key={s.id} className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${activeSegmentIndex === i ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-border/50'}`} onClick={() => playSegment(i)}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-medium line-clamp-1">{s.label}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDeleteSegment(s.id) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" /> {formatTime(s.start)} - {formatTime(s.end)}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <video ref={playbackVideoRef} className="hidden" />
            <audio ref={playbackAudioRef} className="hidden" />
        </div>
    )
}
