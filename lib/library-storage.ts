"use client"

import { get, set } from 'idb-keyval'
import type { Library, LibraryGroup, LibraryVideo, LibrarySegment, TranscriptLine, Recording } from './types'

const LIBRARY_KEY = 'artico-library'
const OLD_LIBRARY_KEY = 'shadowspeak-library' // For migration
const LIBRARY_VERSION = 1

// ================================
// Default Library
// ================================

function createDefaultLibrary(): Library {
    return {
        groups: [],
        version: LIBRARY_VERSION
    }
}

// ================================
// Library CRUD Operations
// ================================

export async function getLibrary(): Promise<Library> {
    try {
        let library = await get<Library>(LIBRARY_KEY)

        // Migration: check if old key has data and new key doesn't
        if (!library) {
            const oldLibrary = await get<Library>(OLD_LIBRARY_KEY)
            if (oldLibrary) {
                console.log('Migrating library data from old key to new key...')
                library = oldLibrary
                await set(LIBRARY_KEY, library) // Save to new key
                // Optionally keep old key as backup, or delete it
            }
        }

        return library || createDefaultLibrary()
    } catch (error) {
        console.error('Failed to load library:', error)
        return createDefaultLibrary()
    }
}

export async function saveLibrary(library: Library): Promise<void> {
    try {
        await set(LIBRARY_KEY, library)
    } catch (error) {
        console.error('Failed to save library:', error)
    }
}

// ================================
// Group Operations
// ================================

export async function createGroup(name: string, emoji: string = '📁'): Promise<LibraryGroup> {
    const library = await getLibrary()

    const newGroup: LibraryGroup = {
        id: crypto.randomUUID(),
        name,
        emoji,
        videos: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        order: library.groups.length
    }

    library.groups.push(newGroup)
    await saveLibrary(library)

    return newGroup
}

export async function updateGroup(groupId: string, updates: Partial<Pick<LibraryGroup, 'name' | 'emoji' | 'order'>>): Promise<void> {
    const library = await getLibrary()
    const group = library.groups.find(g => g.id === groupId)

    if (group) {
        Object.assign(group, updates, { updatedAt: Date.now() })
        await saveLibrary(library)
    }
}

export async function deleteGroup(groupId: string): Promise<void> {
    const library = await getLibrary()
    library.groups = library.groups.filter(g => g.id !== groupId)
    await saveLibrary(library)
}

export async function reorderGroups(groupIds: string[]): Promise<void> {
    const library = await getLibrary()

    groupIds.forEach((id, index) => {
        const group = library.groups.find(g => g.id === id)
        if (group) group.order = index
    })

    library.groups.sort((a, b) => a.order - b.order)
    await saveLibrary(library)
}

// ================================
// Video Operations
// ================================

export async function addVideoToGroup(
    groupId: string,
    videoData: {
        id: string
        title: string
        thumbnail: string
        duration: number
        channelName: string
        transcript: TranscriptLine[]
    }
): Promise<LibraryVideo | null> {
    const library = await getLibrary()
    const group = library.groups.find(g => g.id === groupId)

    if (!group) return null

    // Check if video already exists in group
    if (group.videos.some(v => v.id === videoData.id)) {
        return null
    }

    const newVideo: LibraryVideo = {
        ...videoData,
        segments: [],
        recordings: [],
        addedAt: Date.now(),
        lastPracticedAt: null
    }

    group.videos.push(newVideo)
    group.updatedAt = Date.now()
    await saveLibrary(library)

    return newVideo
}

export async function removeVideoFromGroup(groupId: string, videoId: string): Promise<void> {
    const library = await getLibrary()
    const group = library.groups.find(g => g.id === groupId)

    if (group) {
        group.videos = group.videos.filter(v => v.id !== videoId)
        group.updatedAt = Date.now()
        await saveLibrary(library)
    }
}

export async function updateVideoLastPracticed(groupId: string, videoId: string): Promise<void> {
    const library = await getLibrary()
    const group = library.groups.find(g => g.id === groupId)
    const video = group?.videos.find(v => v.id === videoId)

    if (video) {
        video.lastPracticedAt = Date.now()
        await saveLibrary(library)
    }
}

// ================================
// Segment Operations
// ================================

export async function addSegmentToVideo(
    groupId: string,
    videoId: string,
    segmentData: {
        start: number
        end: number
        label: string
        lines: TranscriptLine[]
    }
): Promise<LibrarySegment | null> {
    const library = await getLibrary()
    const group = library.groups.find(g => g.id === groupId)
    const video = group?.videos.find(v => v.id === videoId)

    if (!video) return null

    const newSegment: LibrarySegment = {
        id: crypto.randomUUID(),
        ...segmentData,
        createdAt: Date.now()
    }

    video.segments.push(newSegment)
    await saveLibrary(library)

    return newSegment
}

export async function updateSegment(
    groupId: string,
    videoId: string,
    segmentId: string,
    updates: Partial<Pick<LibrarySegment, 'label' | 'start' | 'end' | 'lines'>>
): Promise<void> {
    const library = await getLibrary()
    const group = library.groups.find(g => g.id === groupId)
    const video = group?.videos.find(v => v.id === videoId)
    const segment = video?.segments.find(s => s.id === segmentId)

    if (segment) {
        Object.assign(segment, updates)
        await saveLibrary(library)
    }
}

export async function deleteSegment(groupId: string, videoId: string, segmentId: string): Promise<void> {
    const library = await getLibrary()
    const group = library.groups.find(g => g.id === groupId)
    const video = group?.videos.find(v => v.id === videoId)

    if (video) {
        video.segments = video.segments.filter(s => s.id !== segmentId)
        await saveLibrary(library)
    }
}

// ================================
// Recording Operations (for Library videos)
// ================================

export async function addRecordingToVideo(
    groupId: string,
    videoId: string,
    recording: Recording
): Promise<void> {
    const library = await getLibrary()
    const group = library.groups.find(g => g.id === groupId)
    const video = group?.videos.find(v => v.id === videoId)

    if (video) {
        video.recordings.push(recording)
        await saveLibrary(library)
    }
}

export async function deleteRecording(groupId: string, videoId: string, recordingId: string): Promise<void> {
    const library = await getLibrary()
    const group = library.groups.find(g => g.id === groupId)
    const video = group?.videos.find(v => v.id === videoId)

    if (video) {
        video.recordings = video.recordings.filter(r => r.id !== recordingId)
        await saveLibrary(library)
    }
}
