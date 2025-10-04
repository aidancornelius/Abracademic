const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');
const target = process.env.TARGET || 'firefox';

console.log(`Building for target: ${target}`);

// Ensure dist directory exists
const distDir = path.join('dist', target);
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy static files (icons)
const iconsDir = path.join('src', 'icons');
const destIconsDir = path.join(distDir, 'icons');
if (fs.existsSync(iconsDir)) {
  fs.cpSync(iconsDir, destIconsDir, { recursive: true });
}

// Copy HTML files
const htmlFiles = [
  { src: 'src/popup/popup.html', dest: path.join(distDir, 'popup/popup.html') },
  { src: 'src/options/options.html', dest: path.join(distDir, 'options/options.html') },
];
htmlFiles.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
});

const buildOptions = {
  entryPoints: [
    'src/background/service-worker.ts',
    'src/popup/popup.ts',
    'src/options/options.ts'
  ],
  bundle: true,
  outdir: distDir,
  format: 'esm',
  platform: 'browser',
  target: target === 'safari' ? 'safari15' : target === 'chrome' ? 'chrome102' : 'firefox102',
  sourcemap: isWatch ? 'inline' : false,
  minify: !isWatch,
  logLevel: 'info',
  define: {
    '__TARGET__': JSON.stringify(target)
  },
};

async function build() {
  try {
    if (isWatch) {
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
      console.log('Watching for changes...');
    } else {
      await esbuild.build(buildOptions);
      console.log(`✓ Build complete for ${target}`);
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
