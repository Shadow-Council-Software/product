import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const constantsPath = join(
  __dirname,
  '../../lcars-web/src/components/environmental/constants.ts'
);
const cssPath = join(__dirname, '../../lcars-web/src/components/environmental/QuickEnvPin.css');

describe('W-CT-04 QuickEnvPin Green-only width', () => {
  it('compact pin uses max-width from 15% viewport contract', () => {
    const css = readFileSync(cssPath, 'utf8');
    assert.match(css, /\.quick-env-pin--compact/);
    const src = readFileSync(constantsPath, 'utf8');
    assert.match(src, /QUICK_ENV_PIN_MAX_WIDTH_PX/);
    assert.match(src, /0\.15/);
  });

  it('viewport contract constant is 1280px', () => {
    const src = readFileSync(constantsPath, 'utf8');
    assert.match(src, /QUICK_ENV_PIN_VIEWPORT_WIDTH\s*=\s*1280/);
  });

  it('shared authority pin is width-constrained', () => {
    const css = readFileSync(cssPath, 'utf8');
    assert.match(css, /\.quick-env-pin--shared/);
    assert.match(css, /max-width:\s*480px/);
  });
});
