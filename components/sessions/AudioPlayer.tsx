'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Download, Lock, ChevronLeft, ChevronRight } from 'lucide-react'
import { SignInButton } from '@clerk/nextjs'

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const speeds = [0.75, 1, 1.25, 1.5, 2]

type AudioPart = { id: string; label: string; title?: string | null; description?: string | null; url: string; position: number }

export default function AudioPlayer({
  parts,
  isLoggedIn,
}: {
  parts: AudioPart[]
  isLoggedIn: boolean
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speedIndex, setSpeedIndex] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [partIndex, setPartIndex] = useState(0)

  const sorted = [...parts].sort((a, b) => a.position - b.position)
  const current = sorted[partIndex]
  const hasParts = sorted.length > 1

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !current) return
    audio.src = current.url
    audio.load()
    setCurrentTime(0)
    setDuration(0)
  }, [partIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTime = () => setCurrentTime(audio.currentTime)
    const onMeta = () => { setDuration(audio.duration); audio.playbackRate = speeds[speedIndex] }
    const onEnd = () => {
      if (partIndex < sorted.length - 1) {
        setPartIndex((p) => p + 1)
        setTimeout(() => { audioRef.current?.play().catch(() => null); setPlaying(true) }, 200)
      } else {
        setPlaying(false)
      }
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnd)
    }
  }, [partIndex, sorted.length, speedIndex])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const seekTo = useCallback((clientX: number) => {
    const bar = progressRef.current
    const audio = audioRef.current
    if (!bar || !audio || !isFinite(audio.duration)) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    audio.currentTime = ratio * audio.duration
  }, [])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => seekTo(e.clientX)
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, seekTo])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause() } else { audio.play().catch(() => null) }
    setPlaying(!playing)
  }

  const cycleSpeed = () => {
    const next = (speedIndex + 1) % speeds.length
    setSpeedIndex(next)
    if (audioRef.current) audioRef.current.playbackRate = speeds[next]
  }

  if (!isLoggedIn) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Lock size={18} className="text-primary" />
          </div>
          <h3 className="font-semibold">Enregistrement audio</h3>
        </div>
        <p className="text-sm text-muted mb-4">Connectez-vous pour écouter cet enseignement</p>
        <SignInButton mode="modal">
          <button className="bg-primary text-background px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
            Se connecter
          </button>
        </SignInButton>
      </div>
    )
  }

  if (!current) return null

  const displayTitle = current.title || current.label

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
      {/* Titre + description */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-primary">{displayTitle}</p>
          {current.description && <p className="text-xs text-muted mt-0.5">{current.description}</p>}
        </div>
        {hasParts && <span className="text-xs text-muted shrink-0">{partIndex + 1} / {sorted.length}</span>}
      </div>

      <audio ref={audioRef} src={current.url} preload="metadata" />

      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary-light transition-all shrink-0 active:scale-95"
        >
          {playing
            ? <Pause size={20} className="text-background" fill="currentColor" />
            : <Play size={20} className="text-background ml-0.5" fill="currentColor" />
          }
        </button>

        <div className="flex-1 min-w-0 space-y-1">
          <div
            ref={progressRef}
            className="relative h-2 bg-border rounded-full cursor-pointer group"
            onClick={(e) => seekTo(e.clientX)}
            onMouseDown={(e) => { seekTo(e.clientX); setDragging(true) }}
          >
            <div className="absolute inset-y-0 left-0 bg-primary rounded-full transition-[width] duration-100" style={{ width: `${progress}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `calc(${progress}% - 8px)` }} />
          </div>

          <div className="flex items-center justify-between text-xs text-muted">
            <span>{formatTime(currentTime)}</span>
            <div className="flex items-center gap-3">
              {hasParts && (
                <div className="flex items-center gap-1">
                  <button onClick={() => { setPartIndex((p) => Math.max(0, p - 1)); setPlaying(false) }} disabled={partIndex === 0} className="disabled:opacity-30 hover:text-foreground transition-colors">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => { setPartIndex((p) => Math.min(sorted.length - 1, p + 1)); setPlaying(false) }} disabled={partIndex === sorted.length - 1} className="disabled:opacity-30 hover:text-foreground transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
              <button onClick={cycleSpeed} className="px-2 py-0.5 rounded bg-card-hover text-foreground hover:bg-border transition-colors font-medium">
                {speeds[speedIndex]}x
              </button>
              <a href={current.url} download className="flex items-center gap-1 text-muted hover:text-foreground transition-colors">
                <Download size={14} />
              </a>
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
