export function getConfidenceColor(score: number): string {
  if (score >= 80) return 'var(--success)'
  if (score >= 60) return 'var(--accent)'
  if (score >= 40) return 'var(--warning)'
  return 'var(--danger)'
}

export function getConfidenceColorClass(score: number): string {
  if (score >= 80) return 'success'
  if (score >= 60) return 'accent'
  if (score >= 40) return 'warning'
  return 'danger'
}
