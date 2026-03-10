'use client'

import { Share2, Twitter, Copy, Check } from 'lucide-react'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ShareButtonsProps {
  title: string
  text: string
  compact?: boolean
}

export function ShareButtons({ title, text, compact }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const url = 'https://chessgrind.vercel.app'
  const fullText = `${text}\n\n${url}`

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: fullText, url })
        return
      } catch { /* user cancelled */ }
    }
    setOpen(o => !o)
  }, [title, fullText, url])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      const textarea = document.createElement('textarea')
      textarea.value = fullText
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [fullText])

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
  const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`

  if (compact) {
    return (
      <div className="relative">
        <motion.button
          onClick={handleNativeShare}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
          title="Share"
        >
          <Share2 className="w-4 h-4" />
        </motion.button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 4 }}
              className="absolute bottom-full mb-2 right-0 flex gap-1.5 p-1.5 rounded-xl glass-card border border-white/10 shadow-xl z-50"
            >
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Share on X">
                <Twitter className="w-4 h-4 text-sky-400" />
              </a>
              <a href={redditUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Share on Reddit">
                <span className="text-sm font-bold text-orange-400">r/</span>
              </a>
              <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Copy link">
                {copied ? <Check className="w-4 h-4 text-amber-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={handleNativeShare}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share
      </motion.button>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-secondary hover:bg-sky-500/20 text-muted-foreground hover:text-sky-400 transition-colors"
        title="Share on X"
      >
        <Twitter className="w-4 h-4" />
      </a>
      <button
        onClick={handleCopy}
        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
        title="Copy link"
      >
        {copied ? <Check className="w-4 h-4 text-amber-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  )
}
