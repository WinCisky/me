// One-off script: regenerates favicons, app icons and the default OG image
// into public/. Run manually with `node scripts/generate-assets.mjs`
// whenever src/assets/favicon.jpg or src/assets/me.jpg change — outputs are
// committed, so this does not run as part of the build.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = dirname(fileURLToPath(import.meta.url)) + '/..';
const publicDir = join(root, 'public');
await mkdir(publicDir, { recursive: true });

const faviconSrc = join(root, 'src/assets/favicon.jpg');
const avatarSrc = join(root, 'src/assets/me.jpg');

// --- Favicons / app icons --------------------------------------------------

const iconTargets = [
	['favicon-32.png', 32],
	['apple-touch-icon.png', 180],
	['icon-192.png', 192],
	['icon-512.png', 512],
];

for (const [name, size] of iconTargets) {
	await sharp(faviconSrc).resize(size, size).png().toFile(join(publicDir, name));
	console.log(`wrote public/${name} (${size}x${size})`);
}

// classic .ico for very old browsers/crawlers that only look for /favicon.ico.
// sharp cannot encode ICO, so shell out to ImageMagick if it's on PATH; skip
// otherwise (the <link rel="icon"> PNGs above cover every modern browser).
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
try {
	const png32 = join(publicDir, 'favicon-32.png');
	await execFileAsync('magick', [png32, join(publicDir, 'favicon.ico')]);
	console.log('wrote public/favicon.ico');
} catch {
	console.warn('skipped public/favicon.ico — ImageMagick ("magick") not found on PATH');
}

// --- Default OG image (1200x630) -------------------------------------------

const OG_W = 1200;
const OG_H = 630;
const PHOTO_W = 460;

const photo = await sharp(avatarSrc)
	.resize(PHOTO_W, OG_H, { fit: 'cover', position: 'attention' })
	.toBuffer();

const svg = `
<svg width="${OG_W}" height="${OG_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1d1d1f"/>
      <stop offset="100%" stop-color="#0b0b0d"/>
    </linearGradient>
  </defs>
  <rect x="${PHOTO_W}" y="0" width="${OG_W - PHOTO_W}" height="${OG_H}" fill="url(#bg)"/>
  <text x="${PHOTO_W + 80}" y="270" font-family="Arial, sans-serif" font-size="64" font-weight="700" fill="#f5f5f7">Simone Simonella</text>
  <text x="${PHOTO_W + 80}" y="320" font-family="Arial, sans-serif" font-size="32" fill="#98989d">Software Developer</text>
  <rect x="${PHOTO_W + 80}" y="360" width="64" height="4" fill="#0a84ff"/>
  <text x="${PHOTO_W + 80}" y="410" font-family="Arial, sans-serif" font-size="26" fill="#98989d">ssimo.dev</text>
</svg>`;

await sharp({ create: { width: OG_W, height: OG_H, channels: 4, background: '#0b0b0d' } })
	.composite([
		{ input: photo, left: 0, top: 0 },
		{ input: Buffer.from(svg), left: 0, top: 0 },
	])
	.png()
	.toFile(join(publicDir, 'og-default.png'));
console.log(`wrote public/og-default.png (${OG_W}x${OG_H})`);

// --- Web manifest ------------------------------------------------------------

const manifest = {
	name: 'Simone Simonella',
	short_name: 'Simone Simonella',
	description: 'Portfolio and projects of Simone Simonella, software developer.',
	start_url: '/',
	display: 'standalone',
	background_color: '#e9e9ed',
	theme_color: '#e9e9ed',
	icons: [
		{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
		{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
	],
};
await writeFile(join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');
console.log('wrote public/site.webmanifest');

// --- robots.txt ---------------------------------------------------------------

const robots = `User-agent: *\nAllow: /\n\nSitemap: https://ssimo.dev/sitemap.xml\n`;
await writeFile(join(publicDir, 'robots.txt'), robots);
console.log('wrote public/robots.txt');
