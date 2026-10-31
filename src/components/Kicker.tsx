import type { ReactNode } from 'react'

/** Scene label: index, hairline, name. */
export function Kicker({ n, children, className = '' }: { n: string; children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-3 ${className}`}>
      <span className="font-mono text-[0.7rem] text-red">{n}</span>
      <span className="h-px w-8 bg-paper/25" />
      <span className="condensed text-[0.68rem] text-paper/60">{children}</span>
    </p>
  )
}
