import { v4 as uuidv4 } from 'uuid';

// Generate a unique decision ID
export function generateDecisionId(): string {
  return `dec_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
}

// Clamp a value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Normalize a value to 0-1 range given min and max values
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return clamp((value - min) / (max - min), 0, 1);
}

// Invert a normalized score (1 becomes 0, 0 becomes 1)
export function invertScore(score: number): number {
  return 1 - score;
}

// Round to specified decimal places
export function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// Parse time string in HH:MM format to hours (0-24)
export function parseTimeToHours(time: string): number | null {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = parseInt(match[1] ?? '0', 10);
  const minutes = parseInt(match[2] ?? '0', 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours + minutes / 60;
}

// Check if time is late night (10pm - 6am)
export function isLateNight(hours: number): boolean {
  return hours >= 22 || hours < 6;
}

// Check if time is working hours (9am - 6pm)
export function isWorkingHours(hours: number): boolean {
  return hours >= 9 && hours < 18;
}

// Simple stop words set for keyword extraction
export const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
  'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further',
  'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
  'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'just', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours',
  'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself', 'they', 'them', 'their', 'theirs',
  'themselves', 'what', 'which', 'who', 'whom', 'this', 'that',
  'these', 'those', 'am', 'if', 'because', 'until', 'while',
  'about', 'against', 'between', 'into', 'through', 'during',
  'please', 'help', 'need', 'want', 'like', 'know', 'think',
  'make', 'get', 'go', 'see', 'come', 'take', 'use', 'find',
]);

// Extract keywords from text
export function extractKeywords(text: string, maxKeywords: number = 10): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  // Count frequency
  const frequency = new Map<string, number>();
  for (const word of words) {
    frequency.set(word, (frequency.get(word) ?? 0) + 1);
  }

  // Sort by frequency and return top keywords
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

// Measure execution time of a function
export async function measureTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = performance.now() - start;
  return { result, durationMs: round(durationMs, 2) };
}

// Synchronous version for non-async functions
export function measureTimeSync<T>(
  fn: () => T
): { result: T; durationMs: number } {
  const start = performance.now();
  const result = fn();
  const durationMs = performance.now() - start;
  return { result, durationMs: round(durationMs, 2) };
}
