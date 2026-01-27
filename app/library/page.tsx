"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ArrowLeft, Plus, FolderPlus, MoreVertical, Trash2, Edit, Video, Loader2 } from 'lucide-react'
import { getLibrary, createGroup, updateGroup, deleteGroup } from '@/lib/library-storage'
import type { Library, LibraryGroup } from '@/lib/types'

const EMOJI_OPTIONS = ['📁', '🎯', '🎤', '💪', '🧠', '📚', '🌟', '🔥', '💡', '🎬', '🎧', '🗣️']

export default function LibraryPage() {
    const router = useRouter()
    const [library, setLibrary] = useState<Library | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [newGroupEmoji, setNewGroupEmoji] = useState('📁')
    const [editingGroup, setEditingGroup] = useState<LibraryGroup | null>(null)

    const loadLibrary = useCallback(async () => {
        setIsLoading(true)
        const lib = await getLibrary()
        setLibrary(lib)
        setIsLoading(false)
    }, [])

    useEffect(() => {
        loadLibrary()
    }, [loadLibrary])

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return

        setIsCreating(true)
        await createGroup(newGroupName.trim(), newGroupEmoji)
        setNewGroupName('')
        setNewGroupEmoji('📁')
        await loadLibrary()
        setIsCreating(false)
    }

    const handleUpdateGroup = async () => {
        if (!editingGroup || !newGroupName.trim()) return

        await updateGroup(editingGroup.id, {
            name: newGroupName.trim(),
            emoji: newGroupEmoji
        })
        setEditingGroup(null)
        setNewGroupName('')
        setNewGroupEmoji('📁')
        await loadLibrary()
    }

    const handleDeleteGroup = async (groupId: string) => {
        if (confirm('Delete this group and all its videos?')) {
            await deleteGroup(groupId)
            await loadLibrary()
        }
    }

    const openEditDialog = (group: LibraryGroup) => {
        setEditingGroup(group)
        setNewGroupName(group.name)
        setNewGroupEmoji(group.emoji)
    }

    const groups = library?.groups || []

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">My Library</h1>
                            <p className="text-xs text-muted-foreground">
                                {groups.length} group{groups.length !== 1 ? 's' : ''} •
                                {groups.reduce((sum, g) => sum + g.videos.length, 0)} videos
                            </p>
                        </div>
                    </div>

                    {/* Create Group Dialog */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <FolderPlus className="h-4 w-4 mr-2" />
                                New Group
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Group</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="flex gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon" className="text-2xl">
                                                {newGroupEmoji}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="grid grid-cols-6 gap-1 p-2">
                                            {EMOJI_OPTIONS.map(emoji => (
                                                <Button
                                                    key={emoji}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-xl"
                                                    onClick={() => setNewGroupEmoji(emoji)}
                                                >
                                                    {emoji}
                                                </Button>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Input
                                        placeholder="Group name..."
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button onClick={handleCreateGroup} disabled={!newGroupName.trim() || isCreating}>
                                        {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-20">
                        <FolderPlus className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h2 className="text-xl font-semibold mb-2">No groups yet</h2>
                        <p className="text-muted-foreground mb-6">
                            Create your first group to start organizing your practice videos.
                        </p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First Group
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Group</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="flex gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="icon" className="text-2xl">
                                                    {newGroupEmoji}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="grid grid-cols-6 gap-1 p-2">
                                                {EMOJI_OPTIONS.map(emoji => (
                                                    <Button
                                                        key={emoji}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-xl"
                                                        onClick={() => setNewGroupEmoji(emoji)}
                                                    >
                                                        {emoji}
                                                    </Button>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Input
                                            placeholder="Group name..."
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button onClick={handleCreateGroup} disabled={!newGroupName.trim() || isCreating}>
                                            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {groups.map((group) => (
                            <Card
                                key={group.id}
                                className="cursor-pointer hover:border-primary/50 transition-colors group relative"
                                onClick={() => router.push(`/library/${group.id}`)}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{group.emoji}</span>
                                            <div>
                                                <CardTitle className="text-lg">{group.name}</CardTitle>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {group.videos.length} video{group.videos.length !== 1 ? 's' : ''} •
                                                    {group.videos.reduce((sum, v) => sum + v.segments.length, 0)} segments
                                                </p>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(group); }}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {group.videos.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-1 aspect-video rounded overflow-hidden">
                                            {group.videos.slice(0, 4).map((video, i) => (
                                                <div key={video.id} className="bg-secondary overflow-hidden">
                                                    <img
                                                        src={video.thumbnail}
                                                        alt={video.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                            {group.videos.length < 4 && Array(4 - group.videos.length).fill(0).map((_, i) => (
                                                <div key={`empty-${i}`} className="bg-secondary/50 flex items-center justify-center">
                                                    <Video className="h-6 w-6 text-muted-foreground/30" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-secondary/30 rounded flex items-center justify-center">
                                            <p className="text-sm text-muted-foreground">No videos yet</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {/* Add Group Card */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Card className="cursor-pointer border-dashed hover:border-primary/50 transition-colors flex items-center justify-center min-h-[200px]">
                                    <div className="text-center text-muted-foreground">
                                        <Plus className="h-8 w-8 mx-auto mb-2" />
                                        <p className="text-sm">Add Group</p>
                                    </div>
                                </Card>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Group</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="flex gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="icon" className="text-2xl">
                                                    {newGroupEmoji}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="grid grid-cols-6 gap-1 p-2">
                                                {EMOJI_OPTIONS.map(emoji => (
                                                    <Button
                                                        key={emoji}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-xl"
                                                        onClick={() => setNewGroupEmoji(emoji)}
                                                    >
                                                        {emoji}
                                                    </Button>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Input
                                            placeholder="Group name..."
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button onClick={handleCreateGroup} disabled={!newGroupName.trim() || isCreating}>
                                            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </main>

            {/* Edit Group Dialog */}
            <Dialog open={!!editingGroup} onOpenChange={(open) => !open && setEditingGroup(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Group</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="text-2xl">
                                        {newGroupEmoji}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="grid grid-cols-6 gap-1 p-2">
                                    {EMOJI_OPTIONS.map(emoji => (
                                        <Button
                                            key={emoji}
                                            variant="ghost"
                                            size="icon"
                                            className="text-xl"
                                            onClick={() => setNewGroupEmoji(emoji)}
                                        >
                                            {emoji}
                                        </Button>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Input
                                placeholder="Group name..."
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateGroup()}
                                className="flex-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingGroup(null)}>Cancel</Button>
                        <Button onClick={handleUpdateGroup} disabled={!newGroupName.trim()}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
