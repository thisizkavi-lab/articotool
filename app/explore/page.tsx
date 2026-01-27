"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PRESET_CHANNELS, type Channel, type VideoItem } from '@/lib/channels'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Play, Loader2, Users, Search, MoreVertical, Plus, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { getLibrary, addVideoToGroup } from '@/lib/library-storage'
import type { Library } from '@/lib/types'

export default function ExplorePage() {
    const router = useRouter()
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
    const [videos, setVideos] = useState<VideoItem[]>([])
    const [searchResults, setSearchResults] = useState<VideoItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [library, setLibrary] = useState<Library | null>(null)

    useEffect(() => {
        const loadLibrary = async () => {
            const lib = await getLibrary()
            setLibrary(lib)
        }
        loadLibrary()
    }, [])

    useEffect(() => {
        if (selectedChannel) {
            loadChannelVideos(selectedChannel.id)
        }
    }, [selectedChannel])

    const loadChannelVideos = async (channelId: string) => {
        setIsLoading(true)
        setIsSearching(false)
        setSearchResults([])
        try {
            const response = await fetch(`/api/channel/${channelId}`)
            const data = await response.json()
            setVideos(data.videos || [])
        } catch (error) {
            console.error('Failed to load videos:', error)
            setVideos([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!searchQuery.trim()) return

        setIsLoading(true)
        setIsSearching(true)
        setSelectedChannel(null)
        setVideos([])

        try {
            const response = await fetch(`/api/youtube?q=${encodeURIComponent(searchQuery)}`)
            const data = await response.json()
            setSearchResults(data.videos || [])
        } catch (error) {
            console.error('Failed to search videos:', error)
            setSearchResults([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleVideoClick = (videoId: string) => {
        // Navigate to home with the video ID as a query param
        router.push(`/?v=${videoId}`)
    }

    const handleAddToLibrary = async (video: VideoItem, groupId: string) => {
        const toastId = toast.loading(`Adding "${video.title}" to library...`)

        try {
            // First fetch the transcript
            const transcriptRes = await fetch(`/api/transcript?videoId=${video.id}`)
            const transcriptData = await transcriptRes.json()

            // Add to library
            const success = await addVideoToGroup(groupId, {
                id: video.id,
                title: video.title,
                thumbnail: video.thumbnail,
                duration: 0, // Duration will be updated when first played or we can try to fetch it
                channelName: video.channelName,
                transcript: transcriptData.transcript || []
            })

            if (success) {
                toast.success("Added to library", { id: toastId })
            } else {
                toast.error("Already in this group", { id: toastId })
            }
        } catch (error) {
            console.error('Failed to add to library:', error)
            toast.error("Failed to add to library", { id: toastId })
        }
    }

    const handleBack = () => {
        if (selectedChannel) {
            setSelectedChannel(null)
            setVideos([])
        } else if (isSearching) {
            setIsSearching(false)
            setSearchResults([])
            setSearchQuery('')
        } else {
            router.push('/')
        }
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {selectedChannel ? selectedChannel.name : isSearching ? `Search: ${searchQuery}` : 'Explore'}
                        </h1>
                        <p className="text-muted-foreground">
                            {selectedChannel
                                ? `${selectedChannel.handle} • Select a video to practice`
                                : isSearching
                                    ? `Found ${searchResults.length} videos • Select to practice`
                                    : 'Choose a channel or search to browse videos'}
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search YouTube videos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-card"
                        />
                    </div>
                    <Button type="submit" disabled={isLoading || !searchQuery.trim()}>
                        {isLoading && isSearching ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Search className="h-4 w-4 mr-2" />
                        )}
                        Search
                    </Button>
                </form>

                {/* Channel Grid (when no channel selected and not searching) */}
                {!selectedChannel && !isSearching && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {PRESET_CHANNELS.map((channel) => (
                            <Card
                                key={channel.id}
                                className="cursor-pointer hover:border-primary/50 transition-colors"
                                onClick={() => setSelectedChannel(channel)}
                            >
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Users className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{channel.name}</CardTitle>
                                            <CardDescription>{channel.handle}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{channel.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Video Grid (when channel selected or searching) */}
                {(selectedChannel || isSearching) && (
                    <>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (selectedChannel ? videos : searchResults).length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground">
                                {isSearching ? 'No videos found for your search.' : 'No videos found for this channel.'}
                                {isSearching && (
                                    <Button
                                        variant="link"
                                        onClick={() => {
                                            setIsSearching(false)
                                            setSearchResults([])
                                            setSearchQuery('')
                                        }}
                                        className="block mx-auto mt-2"
                                    >
                                        Return to Featured Channels
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {(selectedChannel ? videos : searchResults).map((video) => (
                                    <Card
                                        key={video.id}
                                        className="group relative cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
                                    >
                                        <div className="aspect-video relative bg-secondary" onClick={() => handleVideoClick(video.id)}>
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <Play className="h-12 w-12 text-white" />
                                            </div>
                                        </div>

                                        {/* Actions Menu */}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleVideoClick(video.id)}>
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        <span>Practice Now</span>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            <span>Add to Library</span>
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            {library?.groups.length === 0 ? (
                                                                <DropdownMenuItem disabled>No groups found</DropdownMenuItem>
                                                            ) : (
                                                                library?.groups.map(group => (
                                                                    <DropdownMenuItem key={group.id} onClick={() => handleAddToLibrary(video, group.id)}>
                                                                        <span className="mr-2">{group.emoji}</span>
                                                                        <span>{group.name}</span>
                                                                    </DropdownMenuItem>
                                                                ))
                                                            )}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <CardContent className="p-3" onClick={() => handleVideoClick(video.id)}>
                                            <h3 className="font-medium text-sm line-clamp-2 mb-1">
                                                {video.title}
                                            </h3>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                                    {video.channelName}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {video.publishedAt && format(new Date(video.publishedAt), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
