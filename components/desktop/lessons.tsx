'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from '@/components/chess/chessboard'
import { LESSONS, type Lesson, type LessonChapter, type LessonStep } from '@/lib/chess-data/lessons'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Check,
  Lightbulb,
  GraduationCap,
  Trophy,
  Zap,
} from 'lucide-react'

interface DesktopLessonsProps {
  onNavigate: (page: string) => void
}

export function DesktopLessons({ onNavigate }: DesktopLessonsProps) {
  const { settings } = useSettings()
  const { playSound } = useSoundAndHaptics()
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)

  if (activeLesson) {
    return <DesktopLessonViewer lesson={activeLesson} onBack={() => setActiveLesson(null)} />
  }

  const categoryIcons: Record<string, typeof BookOpen> = {
    fundamentals: GraduationCap,
    tactics: Zap,
    endgame: Trophy,
    strategy: BookOpen,
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Lessons</h1>
        <p className="text-sm text-muted-foreground mt-1">Structured courses to improve your game</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {LESSONS.map((lesson) => {
          const Icon = categoryIcons[lesson.category] || BookOpen
          const totalSteps = lesson.chapters.reduce((sum, ch) => sum + ch.steps.length, 0)
          return (
            <button
              key={lesson.id}
              onClick={() => { playSound('click'); setActiveLesson(lesson) }}
              className="glass-card-hover p-6 text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      lesson.difficulty === 'beginner' ? 'bg-green-500/10 text-green-400' :
                      lesson.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {lesson.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground capitalize">
                      {lesson.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{lesson.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>{lesson.chapters.length} chapters</span>
                    <span>{totalSteps} steps</span>
                    <span className="text-primary font-medium">+{lesson.xpReward} XP</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-3" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DesktopLessonViewer({ lesson, onBack }: { lesson: Lesson; onBack: () => void }) {
  const { addXP } = useGame()
  const { settings } = useSettings()
  const { playSound } = useSoundAndHaptics()
  const [chapterIdx, setChapterIdx] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [taskSolved, setTaskSolved] = useState(false)
  const [wrongMove, setWrongMove] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [boardSize, setBoardSize] = useState(440)

  useEffect(() => {
    const update = () => {
      const h = window.innerHeight
      setBoardSize(Math.min(440, h - 280))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const chapter = lesson.chapters[chapterIdx]
  const step = chapter?.steps[stepIdx]

  const totalSteps = lesson.chapters.reduce((sum, ch) => sum + ch.steps.length, 0)
  const currentGlobalStep = lesson.chapters.slice(0, chapterIdx).reduce((sum, ch) => sum + ch.steps.length, 0) + stepIdx
  const progress = ((currentGlobalStep + (taskSolved ? 1 : 0)) / totalSteps) * 100

  const canGoNext = step?.type !== 'task' || taskSolved

  const goNext = useCallback(() => {
    if (!canGoNext) return
    playSound('click')
    setTaskSolved(false)
    setShowHint(false)
    setWrongMove(false)

    if (stepIdx < chapter.steps.length - 1) {
      setStepIdx(stepIdx + 1)
    } else if (chapterIdx < lesson.chapters.length - 1) {
      setChapterIdx(chapterIdx + 1)
      setStepIdx(0)
    } else {
      setCompleted(true)
      playSound('success')
      addXP(lesson.xpReward)
    }
  }, [canGoNext, stepIdx, chapterIdx, chapter, lesson, playSound, addXP])

  const goPrev = useCallback(() => {
    playSound('click')
    setTaskSolved(false)
    setShowHint(false)
    setWrongMove(false)

    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1)
    } else if (chapterIdx > 0) {
      const prevChapter = lesson.chapters[chapterIdx - 1]
      setChapterIdx(chapterIdx - 1)
      setStepIdx(prevChapter.steps.length - 1)
    }
  }, [stepIdx, chapterIdx, lesson, playSound])

  const handleMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (!step || step.type !== 'task' || !step.expectedMove || taskSolved) return false

    const g = new Chess(step.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    try {
      const move = g.move({ from, to, promotion: promotion || 'q' })
      if (move && move.san === step.expectedMove) {
        setTaskSolved(true)
        setWrongMove(false)
        playSound('success')
        return true
      }
    } catch {}

    setWrongMove(true)
    setShowHint(true)
    playSound('illegal')
    setTimeout(() => setWrongMove(false), 500)
    return false
  }, [step, taskSolved, playSound])

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext() }
      else if (e.key === 'ArrowLeft') { goPrev() }
      else if (e.key === 'Escape') { onBack() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev, onBack])

  if (completed) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-6 py-12">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Lesson Complete!</h2>
            <p className="text-muted-foreground">{lesson.title}</p>
            <p className="text-primary font-semibold mt-2">+{lesson.xpReward} XP</p>
          </div>
          <button onClick={onBack} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium">
            Back to Lessons
          </button>
        </div>
      </div>
    )
  }

  if (!step) return null

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Chapter outline */}
      <div className="w-64 flex-shrink-0 border-r border-white/[0.06] p-5 overflow-y-auto bg-black/10">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{lesson.title}</h3>
        {lesson.chapters.map((ch, ci) => (
          <button
            key={ch.id}
            onClick={() => { setChapterIdx(ci); setStepIdx(0); setTaskSolved(false); setShowHint(false) }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
              ci === chapterIdx ? 'bg-primary/10 text-primary font-medium' :
              ci < chapterIdx ? 'text-muted-foreground' : 'text-muted-foreground/60'
            }`}
          >
            <div className="flex items-center gap-2">
              {ci < chapterIdx ? (
                <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              ) : ci === chapterIdx ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-primary flex-shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 flex-shrink-0" />
              )}
              {ch.title}
            </div>
          </button>
        ))}
      </div>

      {/* Center: Board + Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
        {/* Progress */}
        <div className="w-full max-w-2xl mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{chapter.title}</span>
            <span>{currentGlobalStep + 1}/{totalSteps}</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Board */}
        {(step.type === 'position' || step.type === 'task') && step.fen && (
          <div className={`mb-4 ${wrongMove ? 'animate-shake' : ''}`}>
            <Chessboard
              fen={taskSolved && step.expectedMove ? (() => {
                const g = new Chess(step.fen!); try { g.move(step.expectedMove!); return g.fen() } catch { return step.fen! }
              })() : step.fen}
              size={boardSize}
              interactive={step.type === 'task' && !taskSolved}
              onMove={handleMove}
              isCheck={new Chess(step.fen).isCheck()}
              boardStyle={settings.boardStyle}
              pieceStyle={settings.pieceStyle}
            />
          </div>
        )}

        {/* Content card */}
        <div className="w-full max-w-2xl">
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-5">
            {step.type === 'task' && !taskSolved && (
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Your Turn</span>
              </div>
            )}
            {step.type === 'task' && taskSolved && (
              <div className="flex items-center gap-2 mb-3">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Correct!</span>
              </div>
            )}
            <div className="text-sm text-foreground/90 leading-relaxed">
              {renderMarkdownLite(step.text)}
            </div>
            {showHint && step.hint && !taskSolved && (
              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                <p className="text-xs text-amber-400/80 flex items-start gap-1.5">
                  <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {step.hint}
                </p>
              </div>
            )}
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={goPrev}
              disabled={chapterIdx === 0 && stepIdx === 0}
              className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-medium text-sm disabled:opacity-30 flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={goNext}
              disabled={!canGoNext}
              className={`flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                canGoNext
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-secondary text-muted-foreground opacity-50'
              }`}
            >
              {chapterIdx === lesson.chapters.length - 1 && stepIdx === chapter.steps.length - 1
                ? 'Finish'
                : 'Next'
              } <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function renderMarkdownLite(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>
    }
    return part
  })
}
