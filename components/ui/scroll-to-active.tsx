"use client"
import { useEffect } from "react"

export function ScrollToActiveLine({ containerRef, currentIndex }: { containerRef: React.RefObject<HTMLDivElement | null>, currentIndex: number }) {
    useEffect(() => {
        if (currentIndex !== -1 && containerRef.current) {
            const activeElement = containerRef.current.children[currentIndex] as HTMLElement
            if (activeElement) {
                // Scroll into view comfortably centered
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }
    }, [currentIndex, containerRef])

    return null
}
