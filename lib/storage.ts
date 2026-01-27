import { get, set, del, keys } from 'idb-keyval';
import type { VideoSession, Recording, Segment, TranscriptLine } from './types';

// Key for the current workspace state (active video, segments)
const CURRENT_SESSION_KEY = 'artico-current-session';
const OLD_SESSION_KEY = 'shadowspeak-current-session'; // For migration
const HISTORY_PREFIX = 'history-session-';
const RECORDINGS_PREFIX = 'recording-';

export interface SavedSession {
    id?: string;
    videoId: string;
    videoTitle: string;
    transcript: TranscriptLine[]; // Added transcript support
    segments: Segment[];
    notes?: string;
    platform?: 'youtube' | 'instagram';
    lastUpdated: number;
}

export const StorageService = {
    // Save the current workspace state (video + segments)
    async saveCurrentSession(session: SavedSession): Promise<void> {
        await set(CURRENT_SESSION_KEY, session);
        // Also update history list whenever we save current
        await this.addToHistory(session);
    },

    // Save/Update a session in history
    async addToHistory(session: SavedSession): Promise<void> {
        await set(HISTORY_PREFIX + session.videoId, session);
    },

    // Get all history sessions
    async getHistory(): Promise<SavedSession[]> {
        const allKeys = await keys();
        const historyKeys = allKeys.filter(k =>
            typeof k === 'string' && k.startsWith(HISTORY_PREFIX)
        );

        const history: SavedSession[] = [];
        for (const key of historyKeys) {
            const data = await get<SavedSession>(key);
            if (data) history.push(data);
        }

        return history.sort((a, b) => b.lastUpdated - a.lastUpdated);
    },

    async deleteHistory(videoId: string): Promise<void> {
        await del(HISTORY_PREFIX + videoId);
    },

    // Load the last active session
    async loadCurrentSession(): Promise<SavedSession | undefined> {
        let session = await get<SavedSession>(CURRENT_SESSION_KEY);

        // Migration: check if old key has data and new key doesn't
        if (!session) {
            const oldSession = await get<SavedSession>(OLD_SESSION_KEY);
            if (oldSession) {
                console.log('Migrating session data from old key to new key...');
                session = oldSession;
                await set(CURRENT_SESSION_KEY, session);
            }
        }

        return session;
    },

    // Save a large recording blob
    async saveRecording(recording: Recording): Promise<void> {
        if (recording.blobUrl) {
            const response = await fetch(recording.blobUrl);
            const blob = await response.blob();

            // Store with a specific key
            await set(RECORDINGS_PREFIX + recording.id, {
                ...recording,
                blob, // IndexedDB can store Blobs natively
                blobUrl: undefined, // Don't store the old URL
            });
        }
    },

    // Get all recordings for a specific video/session
    async getAllRecordings(): Promise<Recording[]> {
        const allKeys = await keys();
        const recordingKeys = allKeys.filter(k =>
            typeof k === 'string' && k.startsWith(RECORDINGS_PREFIX)
        );

        const recordings: Recording[] = [];

        for (const key of recordingKeys) {
            const data = await get(key);
            if (data && data.blob) {
                // Recreate the Blob URL for the UI
                const blobUrl = URL.createObjectURL(data.blob);
                recordings.push({
                    ...data,
                    blobUrl,
                });
            }
        }

        return recordings.sort((a, b) => b.createdAt - a.createdAt);
    },

    async deleteRecording(id: string): Promise<void> {
        await del(RECORDINGS_PREFIX + id);
    }
};
