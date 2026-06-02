import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensPath = join(__dirname, '../../lcars-web/src/tokens/okuda-tokens.json');
const tokens = JSON.parse(readFileSync(tokensPath, 'utf8')) as {
  pairs: Array<{ id: string; foreground: string; background: string; minRatio: number }>;
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('W-CT-02 chrome.session contrast token floor', () => {
  for (const pair of tokens.pairs) {
    it(`${pair.id} meets minimum ${pair.minRatio}:1 on ${pair.background}`, () => {
      const ratio = contrastRatio(pair.foreground, pair.background);
      assert.ok(
        ratio >= pair.minRatio,
        `${pair.id}: ${ratio.toFixed(2)} < ${pair.minRatio}`
      );
    });
  }
});
