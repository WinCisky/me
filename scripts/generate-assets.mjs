// One-off script: regenerates favicons, app icons and the default OG image
// into public/. Run manually with `node scripts/generate-assets.mjs`
// whenever src/assets/favicon.jpg or src/assets/me.jpg change — outputs are
// committed, so this does not run as part of the build.
import { access, mkdir, readdir, writeFile } from 'node:fs/promises';
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

// --- Project preview variants ------------------------------------------------
// Deno Deploy has no Sharp at runtime, so previews can't go through Astro's
// on-demand /_image endpoint. Pre-shrink each master preview into a few
// widths here; src/lib/preview-variants.ts (also generated below) lets
// Preview.astro build a real srcset from plain <img> tags.

const projectsDir = join(root, 'src/content/projects');
const PREVIEW_WIDTHS = [480, 960, 1280];
const variantSuffix = /-(?:480|960|1280)\.webp$/;

const previewFiles = (await readdir(projectsDir))
	.filter((f) => f.endsWith('.webp') && !variantSuffix.test(f))
	.sort();

/** @type {Record<string, number[]>} */
const generatedWidths = {};

for (const file of previewFiles) {
	const slug = file.replace(/\.webp$/, '');
	const mdPath = join(projectsDir, `${slug}.md`);
	try {
		await access(mdPath);
	} catch {
		console.warn(`skipped ${file} — no matching ${slug}.md`);
		continue;
	}

	const masterPath = join(projectsDir, file);
	generatedWidths[slug] = [];
	for (const width of PREVIEW_WIDTHS) {
		const outName = `${slug}-${width}.webp`;
		await sharp(masterPath)
			.resize(width, null, { withoutEnlargement: true })
			.webp({ quality: 75 })
			.toFile(join(projectsDir, outName));
		generatedWidths[slug].push(width);
		console.log(`wrote src/content/projects/${outName}`);
	}
}

// --- Avatar variant -----------------------------------------------------------

const AVATAR_WIDTH = 480;
await sharp(avatarSrc)
	.resize(AVATAR_WIDTH, null, { withoutEnlargement: true })
	.webp({ quality: 80 })
	.toFile(join(root, 'src/assets/me-480.webp'));
console.log(`wrote src/assets/me-480.webp (${AVATAR_WIDTH}w)`);

// --- Preview variants manifest -------------------------------------------------
// Consumed by src/components/Preview.astro to build a srcset without going
// through astro:assets at request time.

/** @param {string} slug */
function toIdentifier(slug) {
	return slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

const importLines = [];
const entryLines = [];
for (const [slug, widths] of Object.entries(generatedWidths)) {
	const varNames = [];
	for (const width of widths) {
		const varName = `${toIdentifier(slug)}${width}`;
		importLines.push(`import ${varName} from '../content/projects/${slug}-${width}.webp';`);
		varNames.push(varName);
	}
	entryLines.push(`\t'${slug}': [${varNames.join(', ')}],`);
}

const manifestSrc = `// Generated by scripts/generate-assets.mjs — do not edit.
import type { ImageMetadata } from 'astro';
${importLines.join('\n')}

export const PREVIEW_VARIANTS: Record<string, ImageMetadata[]> = {
${entryLines.join('\n')}
};
`;

await writeFile(join(root, 'src/lib/preview-variants.ts'), manifestSrc);
console.log('wrote src/lib/preview-variants.ts');
