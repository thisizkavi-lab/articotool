'use client'

import { useEffect, type ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAppStore } from '@/lib/store'

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== 'INITIAL_SESSION') useAppStore.getState().setUser(session?.user ?? null)
    })
    void useAppStore.getState().checkAuth()
    return () => subscription.unsubscribe()
  }, [])

  return children
}
