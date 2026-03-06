'use client'

import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/50', className)}
      {...props}
    />
  )
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <Skeleton className="h-4 w-2/3" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </div>
  )
}

export function SkeletonPuzzleList() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="glass-card p-4 flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}
