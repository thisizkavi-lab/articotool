"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Keyboard } from 'lucide-react'

const shortcuts = [
  { key: 'Space', action: 'Play / Pause video' },
  { key: 'H', action: 'Home (full video)' },
  { key: 'L', action: 'Toggle loop' },
  { key: '←', action: 'Seek back 5s' },
  { key: '→', action: 'Seek forward 5s' },
  { key: '↑', action: 'Increase speed' },
  { key: '↓', action: 'Decrease speed' },
  { key: 'N', action: 'Next segment' },
  { key: 'P', action: 'Previous segment' },
  { key: 'R', action: 'Start / Stop recording' },
  { key: 'T', action: 'Retry (discard recording)' },
  { key: 'S', action: 'Toggle sync playback' },
  { key: 'D', action: 'Download recording' },
]

export function KeyboardHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Keyboard shortcuts">
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 mt-4">
          {shortcuts.map(({ key, action }) => (
            <div key={key} className="flex items-center justify-between py-1">
              <span className="text-sm text-muted-foreground">{action}</span>
              <Kbd>{key}</Kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
