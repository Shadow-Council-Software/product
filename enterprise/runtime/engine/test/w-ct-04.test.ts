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
  it('green full-width class spans 100% panel width', () => {
    const css = readFileSync(cssPath, 'utf8');
    assert.match(css, /\.quick-env-pin--green-full/);
    assert.match(css, /width:\s*100%/);
  });

  it('viewport contract constant is 1280px', () => {
    const src = readFileSync(constantsPath, 'utf8');
    assert.match(src, /QUICK_ENV_PIN_VIEWPORT_WIDTH\s*=\s*1280/);
    assert.match(src, /QUICK_ENV_PIN_PANEL_MIN_WIDTH\s*=\s*1280/);
  });

  it('shared authority pin is width-constrained', () => {
    const css = readFileSync(cssPath, 'utf8');
    assert.match(css, /\.quick-env-pin--shared/);
    assert.match(css, /max-width:\s*480px/);
  });
});
