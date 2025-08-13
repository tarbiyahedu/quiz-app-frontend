// src/lib/fontScript.ts
// Utility for auto-detecting script and assigning font class

export function detectScript(text: string): 'bangla' | 'arabic' | 'english' {
  if (/[ঀ-৾]/.test(text)) return 'bangla';
  if (/[ء-ي]/.test(text)) return 'arabic';
  return 'english';
}

export function fontClass(text: string): string {
  const script = detectScript(text);
  if (script === 'bangla') return 'bangla';
  if (script === 'arabic') return 'arabic';
  return 'english';
}
