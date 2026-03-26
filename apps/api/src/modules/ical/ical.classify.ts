const BLOCKED_PATTERNS = [
  /not available/i,
  /blocked/i,
  /unavailable/i,
  /maintenance/i,
  /airbnb \(not available\)/i,
  /closed/i,
];

export function classifyEvent(summary: string): 'booked' | 'blocked' {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(summary)) return 'blocked';
  }
  return 'booked';
}
