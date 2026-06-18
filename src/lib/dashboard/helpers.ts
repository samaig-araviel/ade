export function getProviderColor(provider: string): string {
  switch (provider.toLowerCase()) {
    case 'anthropic':
      return '#D97706';
    case 'openai':
      return '#059669';
    case 'google':
      return '#2563EB';
    default:
      return '#6B7280';
  }
}

export function formatScore(score: number | undefined | null): string {
  if (score === undefined || score === null || isNaN(score)) return '—';
  return Math.round(score * 100).toString();
}

export function formatWeight(weight: number | undefined | null): string {
  if (weight === undefined || weight === null || isNaN(weight)) return '—';
  return `${Math.round(weight * 100)}%`;
}
