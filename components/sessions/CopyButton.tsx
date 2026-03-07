'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 bg-card-hover text-foreground px-3 py-2 rounded-lg text-sm hover:bg-border transition-colors"
    >
      {copied ? <Check size={14} className="text-nouveau" /> : <Copy size={14} />}
      {copied ? 'Copie !' : 'Copier la liste'}
    </button>
  )
}
