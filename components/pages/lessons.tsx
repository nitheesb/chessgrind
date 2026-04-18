'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from '@/components/chess/chessboard'
import { LESSONS, type Lesson, type LessonChapter, type LessonStep } from '@/lib/chess-data/lessons'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { useMobileBoardSize } from '@/lib/use-mobile-board-size'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Check,
  Lightbulb,
  GraduationCap,
  Trophy,
  Zap,
  Lock,
} from 'lucide-react'

interface LessonsPageProps {
  onBack: () => void
}

export function LessonsPage({ onBack }: LessonsPageProps) {
  const { playSound } = useSoundAndHaptics()
  const { settings } = useSettings()
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)

  if (activeLesson) {
    return <LessonViewer lesson={activeLesson} onBack={() => setActiveLesson(null)} />
  }

  const categoryIcons = {
    fundamentals: GraduationCap,
    tactics: Zap,
    endgame: Trophy,
    strategy: BookOpen,
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Lessons</h1>
          <p className="text-xs text-muted-foreground">{LESSONS.length} courses available</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {LESSONS.map((lesson) => {
          const Icon = categoryIcons[lesson.category] || BookOpen
          const totalSteps = lesson.chapters.reduce((sum, ch) => sum + ch.steps.length, 0)
          return (
            <button
              key={lesson.id}
              onClick={() => { playSound('click'); setActiveLesson(lesson) }}
              className="w-full bg-secondary rounded-xl p-4 text-left active:bg-secondary/70 hover:bg-secondary/80 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      lesson.difficulty === 'beginner' ? 'bg-green-500/10 text-green-400' :
                      lesson.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {lesson.difficulty}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground capitalize">
                      {lesson.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{lesson.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{lesson.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span>{lesson.chapters.length} chapters</span>
                    <span>{totalSteps} steps</span>
                    <span className="text-primary">+{lesson.xpReward} XP</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-3" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LessonViewer({ lesson, onBack }: { lesson: Lesson; onBack: () => void }) {
  const { addXP } = useGame()
  const { settings } = useSettings()
  const { playSound, triggerHaptic } = useSoundAndHaptics()
  const boardSize = useMobileBoardSize(360)
  const [chapterIdx, setChapterIdx] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [taskSolved, setTaskSolved] = useState(false)
  const [wrongMove, setWrongMove] = useState(false)
  const [completed, setCompleted] = useState(false)

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
      triggerHaptic('success')
      addXP(lesson.xpReward)
    }
  }, [canGoNext, stepIdx, chapterIdx, chapter, lesson, playSound, triggerHaptic, addXP])

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
        triggerHaptic('light')
        return true
      }
    } catch {}

    setWrongMove(true)
    setShowHint(true)
    playSound('illegal')
    triggerHaptic('error')
    setTimeout(() => setWrongMove(false), 500)
    return false
  }, [step, taskSolved, playSound, triggerHaptic])

  if (completed) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Lesson Complete!</h2>
          <p className="text-muted-foreground">{lesson.title}</p>
          <p className="text-primary font-semibold mt-2">+{lesson.xpReward} XP</p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium"
        >
          Back to Lessons
        </button>
      </div>
    )
  }

  if (!step) return null

  return (
    <div className="flex flex-col gap-3 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground">{lesson.title}</p>
          <h2 className="text-sm font-semibold text-foreground truncate">{chapter.title}</h2>
        </div>
        <span className="text-xs text-muted-foreground">{currentGlobalStep + 1}/{totalSteps}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Board (for position and task steps) */}
      {(step.type === 'position' || step.type === 'task') && step.fen && (
        <div className="flex justify-center">
          <div className={wrongMove ? 'animate-shake' : ''}>
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
        </div>
      )}

      {/* Text content */}
      <div className="bg-secondary rounded-xl p-4">
        {step.type === 'task' && !taskSolved && (
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">YOUR TURN</span>
          </div>
        )}
        {step.type === 'task' && taskSolved && (
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-xs font-semibold text-green-400">CORRECT!</span>
          </div>
        )}
        <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
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

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={goPrev}
          disabled={chapterIdx === 0 && stepIdx === 0}
          className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-medium text-sm disabled:opacity-30 flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={goNext}
          disabled={!canGoNext}
          className={`flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 ${
            canGoNext
              ? 'bg-primary text-primary-foreground'
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
  )
}

/** Simple markdown-like rendering for bold text */
function renderMarkdownLite(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>
    }
    return part
  })
}
