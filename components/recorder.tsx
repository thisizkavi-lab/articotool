"use client"

import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Mic, Video, Square, RotateCcw, Download, Circle, Play, Trash2, FileText } from 'lucide-react'

export function Recorder() {
  const {
    activeSegmentId,
    addRecording,
    isRecording,
    setIsRecording,
    segments,
    recordings,
    removeRecording,
    transcript,
    currentTime,
  } = useAppStore()

  // Panel mode: transcript or record
  const [panelMode, setPanelMode] = useState<'transcript' | 'record'>('record')

  // Recording options
  const [recordAudio, setRecordAudio] = useState(true)
  const [recordVideo, setRecordVideo] = useState(true)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const liveVideoRef = useRef<HTMLVideoElement>(null)
  const playbackVideoRef = useRef<HTMLVideoElement>(null)
  const playbackAudioRef = useRef<HTMLAudioElement>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  const activeSegment = segments.find(s => s.id === activeSegmentId)
  const segmentRecordings = recordings.filter(r => r.segmentId === activeSegmentId)
  const canRecord = recordAudio || recordVideo

  // Stop all media streams completely
  const stopAllStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
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
      // Only start preview when in record mode, not recording, no preview URL, and segment selected
      if (panelMode === 'record' && !isRecording && !previewUrl && (recordVideo || recordAudio) && activeSegmentId) {
        stopAllStreams()

        try {
          const constraints: MediaStreamConstraints = {
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
      } else if (panelMode !== 'record' || !activeSegmentId) {
        stopAllStreams()
      }
    }

    setupStream()

    return () => {
      cancelled = true
      if (panelMode !== 'record') {
        stopAllStreams()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelMode, isRecording, previewUrl, recordVideo, recordAudio, activeSegmentId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllStreams()
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }
  }, [])

  const startRecording = async () => {
    if (!activeSegmentId || (!recordAudio && !recordVideo)) return

    // Countdown
    setCountdown(3)
    for (let i = 2; i >= 0; i--) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCountdown(i === 0 ? null : i)
    }

    try {
      let stream = streamRef.current

      if (!stream) {
        const constraints: MediaStreamConstraints = {
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
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }

        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = null
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100)
      setIsRecording(true)
      setRecordingTime(0)

      // Note: Sync with YouTube player would require player reference
      // For home page, recording is independent

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
    if (!previewUrl || !activeSegmentId) return

    const recording = {
      id: `rec-${Date.now()}`,
      segmentId: activeSegmentId,
      blobUrl: previewUrl,
      createdAt: Date.now(),
      type: recordVideo ? 'video' as const : 'audio' as const,
    }

    addRecording(recording)
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

  // Sync playback: play user recording (sync with YouTube not available in component)
  const playSyncRecording = (rec: { blobUrl: string; type: string }) => {
    // In the home page recorder, we just play the recording
    // True sync playback is available in the practice page
    playOnlyRecording(rec)
  }

  const playOnlyRecording = (rec: { blobUrl: string; type: string }) => {
    if (rec.type === 'video' && playbackVideoRef.current) {
      playbackVideoRef.current.src = rec.blobUrl
      playbackVideoRef.current.currentTime = 0
      playbackVideoRef.current.play()
    } else if (playbackAudioRef.current) {
      playbackAudioRef.current.src = rec.blobUrl
      playbackAudioRef.current.currentTime = 0
      playbackAudioRef.current.play()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get transcript text for active segment
  const getSegmentText = () => {
    if (!activeSegment || !transcript) return ''
    const lines = transcript.filter(
      line => line.start >= activeSegment.start && line.start < activeSegment.end
    )
    return lines.map(line => line.text).join(' ')
  }

  // Hidden elements for playback
  const hiddenPlayback = (
    <>
      <video ref={playbackVideoRef} className="hidden" />
      <audio ref={playbackAudioRef} className="hidden" />
    </>
  )

  return (
    <div className="h-full flex flex-col">
      {hiddenPlayback}

      {/* Toggle Header */}
      <div className="flex border-b border-border/50">
        <button
          className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${panelMode === 'transcript' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'
            }`}
          onClick={() => setPanelMode('transcript')}
        >
          <FileText className="h-4 w-4" />
          Transcript
        </button>
        <button
          className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${panelMode === 'record' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/50'
            }`}
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
          <div className="space-y-4">
            {activeSegment ? (
              <>
                <h3 className="font-medium">{activeSegment.label}</h3>
                <p className="text-2xl leading-relaxed">
                  {getSegmentText() || 'No transcript available for this segment.'}
                </p>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Select a segment to see its transcript</p>
              </div>
            )}
          </div>
        ) : (
          /* Record Mode */
          <div className="space-y-4">
            {!activeSegmentId ? (
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
                    recordVideo ? (
                      <video
                        src={previewUrl}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <audio src={previewUrl} controls className="w-4/5" />
                      </div>
                    )
                  ) : recordVideo ? (
                    <video
                      ref={liveVideoRef}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
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
                            {rec.type === 'video' ? 'Video' : 'Audio'}
                          </span>
                          <div className="flex-1" />
                          <Button size="sm" variant="outline" onClick={() => playSyncRecording(rec)} className="gap-1">
                            <Play className="h-3 w-3" />
                            Sync
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => playOnlyRecording(rec)}>
                            Play Mine
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeRecording(rec.id)}>
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
  )
}
