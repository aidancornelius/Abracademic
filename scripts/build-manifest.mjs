import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = process.env.TARGET || 'firefox';
const root = path.resolve(__dirname, '..');

console.log(`Building manifest for target: ${target}`);

// Read base manifest
const basePath = path.join(root, 'src/manifests/manifest.base.json');
const base = JSON.parse(fs.readFileSync(basePath, 'utf8'));

// Read target-specific patch
let patch = {};
const patchPath = path.join(root, `src/manifests/manifest.${target}.jsonc`);
try {
  const raw = fs.readFileSync(patchPath, 'utf8');
  // Strip comments from JSONC
  const noComments = raw.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const trimmed = noComments.trim();
  if (trimmed && trimmed !== '{}') {
    patch = JSON.parse(trimmed);
  }
} catch (err) {
  console.warn(`No patch found for ${target}, using base manifest only`);
}

// Deep merge: patch overrides base
function deepMerge(target, source) {
  const output = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

const manifest = deepMerge(base, patch);

// Write to dist
const outDir = path.resolve(root, `dist/${target}`);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log(`✓ Manifest written to dist/${target}/manifest.json`);
