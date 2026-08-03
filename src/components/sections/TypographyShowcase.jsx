import { useState } from 'react'

const SCALE = [
  { tag: 'h1',      className: 'text-h1 font-bold',        sizeRem: 3.815,  fluid: true  },
  { tag: 'h2',      className: 'text-h2 font-bold',        sizeRem: 3.052,  fluid: true  },
  { tag: 'h3',      className: 'text-h3 font-semibold',    sizeRem: 2.441,  fluid: true  },
  { tag: 'h4',      className: 'text-h4 font-semibold',    sizeRem: 1.953,  fluid: false },
  { tag: 'h5',      className: 'text-h5 font-semibold',    sizeRem: 1.5625, fluid: false },
  { tag: 'body-lg', className: 'text-body-lg',             sizeRem: 1.25,   fluid: false },
  { tag: 'body',    className: 'text-body', highlight: true, sizeRem: 1,    fluid: false },
  { tag: 'body-sm', className: 'text-body-sm',             sizeRem: 0.8,    fluid: false },
  { tag: 'caption', className: 'text-caption text-muted',  sizeRem: 1,      fluid: false },
]

const PLAYFAIR = [
  { tag: 'h1', className: 'text-h1 font-playfair italic', sizeRem: 3.815 },
  { tag: 'h2', className: 'text-h2 font-playfair italic', sizeRem: 3.052 },
  { tag: 'h3', className: 'text-h3 font-playfair italic', sizeRem: 2.441 },
]

function fmt(rem, unit) {
  const px = rem * 16
  if (unit === 'px') return `${px}px`
  if (unit === 'pt') return `${(px * 0.75).toFixed(2)}pt`
  return `${rem}rem`
}

export function TypographyShowcase() {
  const [unit, setUnit] = useState('rem')

  return (
    <section className="bg-white section-padding border-t border-border">
      <div className="container-xl">

        {/* Unit switcher */}
        <div className="flex gap-1 mb-10 border border-border rounded-xl p-1 w-fit">
          {['rem', 'px', 'pt'].map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`px-4 py-1.5 rounded-lg text-body-sm font-semibold uppercase transition-all ${
                unit === u ? 'bg-surface text-text shadow-sm' : 'text-muted hover:text-text'
              }`}
            >
              {u}
            </button>
          ))}
        </div>

        {/* Inter scale */}
        <div className="divide-y divide-border overflow-hidden">
          {SCALE.map((item) => (
            <div
              key={item.tag}
              className={`flex items-center gap-6 py-3 ${item.highlight ? 'bg-surface -mx-4 px-4 rounded-lg' : ''}`}
            >
              <span className="w-16 text-right text-body-sm font-mono text-muted shrink-0">{item.tag}</span>
              <span className="w-24 text-right text-body-sm font-mono text-muted shrink-0">
                {item.fluid ? '~' : ''}{fmt(item.sizeRem, unit)}
              </span>
              <span className={`${item.className} text-text leading-tight truncate min-w-0`}>
                The quick brown fox jumps over the lazy dog
              </span>
            </div>
          ))}
        </div>

        {/* Playfair scale */}
        <div className="mt-12 pt-8 border-t border-border overflow-hidden">
          <p className="text-body-sm font-mono text-muted mb-4">playfair display — italic</p>
          <div className="divide-y divide-border">
            {PLAYFAIR.map((item) => (
              <div key={item.tag} className="flex items-center gap-6 py-3">
                <span className="w-16 text-right text-body-sm font-mono text-muted shrink-0">{item.tag}</span>
                <span className="w-24 text-right text-body-sm font-mono text-muted shrink-0">
                  ~{fmt(item.sizeRem, unit)}
                </span>
                <span className={`${item.className} text-primary leading-tight truncate min-w-0`}>
                  The quick brown fox jumps over the lazy dog
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
