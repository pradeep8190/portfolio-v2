import { useEffect, useRef, useState, useCallback } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { PROJECTS } from '../data/projects'
import { ShockwaveShowcase } from './ShockwaveShowcase'
import './RightPanel.css'

interface RightPanelProps {
  onProjectChange?: (index: number) => void
  onProgressChange?: (ratio: number) => void
  scrollToRef?: React.MutableRefObject<((index: number) => void) | null>
}

export const RightPanel = ({
  onProjectChange,
  onProgressChange,
  scrollToRef,
}: RightPanelProps = {}) => {
  const lenisRef = useRef<Lenis | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)

  const [activeIndex, setActiveIndex] = useState(0)
  const [targetIndex, setTargetIndex] = useState(1)
  const [progress, setProgress] = useState(0)
  const [direction, setDirection] = useState(1)
  const [scrollRatio, setScrollRatio] = useState(0)
  const lastScrollYRef = useRef(0)
  const trackRef = useRef<HTMLDivElement | null>(null)

  // Calculate GPU shader transition progress based on scroll
  const updateScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const totalScrollable = container.scrollHeight - window.innerHeight
    if (totalScrollable <= 0) return

    const currentScroll = Math.max(0, -rect.top)
    const diff = currentScroll - lastScrollYRef.current
    if (Math.abs(diff) > 0.5) {
      setDirection(diff >= 0 ? 1 : -1)
      lastScrollYRef.current = currentScroll
    }

    const ratio = Math.max(0, Math.min(1, currentScroll / totalScrollable))
    setScrollRatio(ratio)

    // Map ratio across the project transitions
    const numSegments = PROJECTS.length - 1
    const rawSegment = ratio * numSegments
    const baseIdx = Math.min(numSegments - 1, Math.floor(rawSegment))
    const frac = rawSegment - baseIdx

    // Deadband curve with smooth cubic hermite easing for organic Apple-like fluidity
    let transProgress = 0
    const nextIdx = Math.min(PROJECTS.length - 1, baseIdx + 1)

    if (frac <= 0.08) {
      transProgress = 0
    } else if (frac >= 0.92) {
      transProgress = 1
    } else {
      const linear = (frac - 0.08) / 0.84
      // Smooth cubic hermite easing for gentle, cinematic pacing
      transProgress = linear * linear * (3 - 2 * linear)
    }

    setActiveIndex(baseIdx)
    setTargetIndex(nextIdx)
    setProgress(transProgress)

    const prominentIdx = transProgress >= 0.5 ? nextIdx : baseIdx
    onProjectChange?.(prominentIdx)
    onProgressChange?.(ratio)
  }, [onProjectChange, onProgressChange])

  // Interactive pill scrollbar click
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current
    const lenis = lenisRef.current
    const container = containerRef.current
    if (!track || !lenis || !container) return

    const trackRect = track.getBoundingClientRect()
    const clickY = e.clientY - trackRect.top
    const targetRatio = Math.max(0, Math.min(1, clickY / trackRect.height))
    const totalScrollable = container.scrollHeight - window.innerHeight
    lenis.scrollTo(targetRatio * totalScrollable, { duration: 1.2 })
  }

  // Ensure the page always lands at the top on load/refresh
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [])

  // Initialize Lenis smooth scroll with luxurious, weighted pacing
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.72,
      touchMultiplier: 1.0,
    })

    lenisRef.current = lenis
    lenis.scrollTo(0, { immediate: true })

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    lenis.on('scroll', updateScroll)
    window.addEventListener('resize', updateScroll)

    const timer = setTimeout(updateScroll, 100)

    if (scrollToRef) {
      scrollToRef.current = (targetProjectIdx: number) => {
        if (!containerRef.current || !lenisRef.current) return
        const numSegments = PROJECTS.length - 1
        const targetRatio = Math.max(0, Math.min(1, targetProjectIdx / numSegments))
        const totalScrollable = containerRef.current.scrollHeight - window.innerHeight
        lenisRef.current.scrollTo(targetRatio * totalScrollable, { duration: 1.4 })
      }
    }

    return () => {
      if (scrollToRef) {
        scrollToRef.current = null
      }
      clearTimeout(timer)
      window.removeEventListener('resize', updateScroll)
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [updateScroll, scrollToRef])

  // Active project for the top pinned header
  const displayProject =
    progress >= 0.5
      ? PROJECTS[targetIndex] || PROJECTS[0]
      : PROJECTS[activeIndex] || PROJECTS[0]

  return (
    <section className="right-panel" ref={containerRef}>
      {/* ── Single Full-Width Pinned Top Header (Syncs with Active Project) ── */}
      <header className="rp-pinned-header">
        <div key={displayProject.id} className="rp-pinned-content">
          <div className="rp-pinned-left-meta">
            <span className="rp-pinned-index">{displayProject.index}</span>
            <span className="rp-pinned-divider" />
            <span className="rp-pinned-title">{displayProject.title}</span>
            <span className="rp-pinned-category">{displayProject.category}</span>
          </div>
          <div className="rp-pinned-right-meta">
            <span className="rp-status-pill">
              <span className="rp-live-dot" />
              {displayProject.status}
            </span>
            <span className="rp-year-badge">{displayProject.year}</span>
          </div>
        </div>
      </header>

      {/* ── Pinned Stage: WebGL Apple-Grade Shockwave, Refraction & Spectral Prism Dissolve ── */}
      <div className="rp-stage-pinned">
        <ShockwaveShowcase
          activeIndex={activeIndex}
          targetIndex={targetIndex}
          progress={progress}
          direction={direction}
        />
      </div>

      {/* ── Scroll Height Track (Extended to 150vh per project for slower, majestic shockwave pacing) ── */}
      <div
        className="rp-scroll-track"
        style={{ height: `${PROJECTS.length * 150}vh` }}
        aria-hidden="true"
      />

      {/* ── Custom Floating Minimalist Pill Scrollbar ── */}
      <aside
        className="rp-pill-scrollbar-track"
        ref={trackRef}
        onClick={handleTrackClick}
        aria-label="Scroll progress"
      >
        <div
          className="rp-pill-scrollbar-thumb"
          style={{
            transform: `translate3d(0, ${scrollRatio * (160 - 28)}px, 0)`,
          }}
        />
      </aside>

    </section>
  )
}

export default RightPanel
