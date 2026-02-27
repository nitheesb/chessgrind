'use client'

import { motion } from 'framer-motion'
import { useSettings } from '@/lib/settings-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import {
  Volume2,
  VolumeX,
  Vibrate,
  Grid3X3,
  Eye,
  MousePointer,
  Moon,
  Sun,
  Monitor,
  ChevronLeft,
} from 'lucide-react'



interface DesktopSettingsProps {
  onNavigate: (page: string) => void
}

export function DesktopSettings({ onNavigate }: DesktopSettingsProps) {
  const { settings, updateSetting } = useSettings()
  const { playSound } = useSoundAndHaptics()

  const toggleSetting = (key: keyof typeof settings) => {
    playSound('click')
    updateSetting(key, !settings[key] as any)
  }

  const settingsSections = [
    {
      title: 'Sound & Feedback',
      items: [
        {
          key: 'soundEnabled' as const,
          label: 'Sound Effects',
          description: 'Play sounds for moves, captures, and game events',
          icon: settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />,
        },
        {
          key: 'hapticEnabled' as const,
          label: 'Haptic Feedback',
          description: 'Vibration feedback on mobile devices',
          icon: <Vibrate className="w-5 h-5" />,
        },
      ],
    },
    {
      title: 'Board Display',
      items: [
        {
          key: 'showCoordinates' as const,
          label: 'Show Coordinates',
          description: 'Display rank and file labels on the board',
          icon: <Grid3X3 className="w-5 h-5" />,
        },
        {
          key: 'showHints' as const,
          label: 'Show Hints',
          description: 'Show move hints when selecting a piece',
          icon: <Eye className="w-5 h-5" />,
        },
        {
          key: 'autoQueen' as const,
          label: 'Auto Queen',
          description: 'Automatically promote pawns to queen',
          icon: <MousePointer className="w-5 h-5" />,
        },
      ],
    },
  ]

  const boardStyles = [
    { id: 'green', name: 'Classic', light: '#eeeed2', dark: '#769656' },
    { id: 'brown', name: 'Wooden', light: '#f0d9b5', dark: '#b58863' },
    { id: 'blue', name: 'Ocean', light: '#dee3e6', dark: '#8ca2ad' },
    { id: 'purple', name: 'Royal', light: '#e8d0e8', dark: '#9070a0' },
  ]

  return (
    <div
      className="p-8 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => {
            playSound('click')
            onNavigate('profile')
          }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Profile
        </button>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Customize your ChessVault experience</p>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section) => (
        <div key={section.title} className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">{section.title}</h2>
          <div className="glass-card divide-y divide-border/50">
            {section.items.map((settingItem) => (
              <div
                key={settingItem.key}
                className="flex items-center justify-between p-5"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings[settingItem.key] ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                    }`}>
                    {settingItem.icon}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{settingItem.label}</p>
                    <p className="text-sm text-muted-foreground">{settingItem.description}</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => toggleSetting(settingItem.key)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${settings[settingItem.key] ? 'bg-primary' : 'bg-secondary'
                    }`}
                >
                  <div
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-150 ease-out"
                    style={{ left: settings[settingItem.key] ? 30 : 4 }}
                  />
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Board Style */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Board Style</h2>
        <div className="grid grid-cols-4 gap-4">
          {boardStyles.map((style) => (
            <motion.button
              key={style.id}
              onClick={() => {
                playSound('click')
                updateSetting('boardStyle', style.id as any)
              }}
              className={`p-4 rounded-2xl border-2 transition-all ${settings.boardStyle === style.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-border/80 bg-card'
                }`}
            >
              {/* Mini board preview */}
              <div className="w-full aspect-square rounded-lg overflow-hidden mb-3 shadow-md">
                <div className="grid grid-cols-4 h-full">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: (Math.floor(i / 4) + (i % 4)) % 2 === 0
                          ? style.light
                          : style.dark,
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className={`text-sm font-medium ${settings.boardStyle === style.id ? 'text-primary' : 'text-foreground'
                }`}>
                {style.name}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Piece Style */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Piece Style</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { id: 'standard', name: 'Standard', fill: '#fff', stroke: '#000', strokeWidth: 1.5 },
            { id: 'neo', name: 'Neo', fill: '#f8f8f8', stroke: '#555', strokeWidth: 1.5 },
            { id: 'classic', name: 'Classic', fill: '#f5e6c8', stroke: '#4a3728', strokeWidth: 2 },
            { id: 'minimal', name: 'Minimal', fill: '#fff', stroke: '#999', strokeWidth: 1 },
          ].map((ps) => (
            <motion.button
              key={ps.id}
              onClick={() => {
                playSound('click')
                updateSetting('pieceStyle', ps.id as any)
              }}
              className={`p-4 rounded-2xl border-2 transition-all ${settings.pieceStyle === ps.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-border/80 bg-card'
                }`}
            >
              <div className="w-full flex items-center justify-center mb-3">
                <svg viewBox="0 0 45 45" width={48} height={48}>
                  <path 
                    d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
                    fill={ps.fill}
                    stroke={ps.stroke}
                    strokeWidth={ps.strokeWidth}
                  />
                </svg>
              </div>
              <p className={`text-sm font-medium ${settings.pieceStyle === ps.id ? 'text-primary' : 'text-foreground'}`}>
                {ps.name}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div variants={item}>
        <h2 className="text-lg font-semibold text-foreground mb-4">Theme</h2>
        <div className="glass-card p-5">
          <div className="flex gap-4">
            {[
              { id: 'system', name: 'System', icon: <Monitor className="w-5 h-5" /> },
              { id: 'light', name: 'Light', icon: <Sun className="w-5 h-5" /> },
              { id: 'dark', name: 'Dark', icon: <Moon className="w-5 h-5" /> },
            ].map((theme) => (
              <motion.button
                key={theme.id}
                onClick={() => {
                  playSound('click')
                  updateSetting('theme', theme.id as any)
                }}
                className={`flex-1 py-4 rounded-xl flex flex-col items-center gap-2 transition-all ${settings.theme === theme.id
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
              >
                {theme.icon}
                <span className="text-sm font-medium">{theme.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
