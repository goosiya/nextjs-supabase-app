'use client'

import { useState } from 'react'
import { Check, Copy, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareButtonProps {
  slug: string
}

export function ShareButton({ slug }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const url = `${window.location.origin}/events/${slug}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 items-center gap-2 rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
        <Link size={14} className="shrink-0" />
        <span className="truncate">/events/{slug}</span>
      </div>
      <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0 gap-1.5">
        {copied ? (
          <>
            <Check size={14} />
            복사됨
          </>
        ) : (
          <>
            <Copy size={14} />
            링크 복사
          </>
        )}
      </Button>
    </div>
  )
}
