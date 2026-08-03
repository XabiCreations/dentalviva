/**
 * Typography — Semantic/visual-decoupled text components.
 *
 * <Heading as="h1" size="display">Título</Heading>
 *   as   → HTML tag (h1–h6, p, span…) — controls semantics
 *   size → visual scale token (display | h1 | h2 | h3 | h4 | h5)
 *
 * <Text size="body-lg">Párrafo</Text>
 *   size → body-lg | body | body-sm | caption
 */

const HEADING_SIZE_MAP = {
  display: 'text-display',
  h1:      'text-h1',
  h2:      'text-h2',
  h3:      'text-h3',
  h4:      'text-h4',
  h5:      'text-h5',
}

const TEXT_SIZE_MAP = {
  'body-lg': 'text-body-lg',
  'body':    'text-body-sm',
  'body-sm': 'text-body-sm',
  'caption': 'text-caption',
}

export function Heading({ as: Tag = 'h2', size = 'h2', className = '', children, ...props }) {
  const sizeClass = HEADING_SIZE_MAP[size] ?? HEADING_SIZE_MAP.h2
  return (
    <Tag className={`${sizeClass} font-bold ${className}`} {...props}>
      {children}
    </Tag>
  )
}

export function Text({ as: Tag = 'p', size = 'body', className = '', children, ...props }) {
  const sizeClass = TEXT_SIZE_MAP[size] ?? TEXT_SIZE_MAP.body
  return (
    <Tag className={`${sizeClass} ${className}`} {...props}>
      {children}
    </Tag>
  )
}
