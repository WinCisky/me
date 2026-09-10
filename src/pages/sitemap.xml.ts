import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { fetchPublicRepos, GITHUB_USER } from '../lib/github';

interface UrlEntry {
	loc: string;
	lastmod?: string;
}

export const GET: APIRoute = async ({ site }) => {
	const base = site ?? new URL('https://ssimo.dev');

	const staticEntries: UrlEntry[] = [
		{ loc: '/' },
		{ loc: '/projects' },
		{ loc: '/about' },
	];

	const projects = await getCollection('projects');

	let reposByName = new Map<string, string>();
	try {
		const repos = await fetchPublicRepos(GITHUB_USER);
		reposByName = new Map(repos.map((repo) => [repo.name.toLowerCase(), repo.pushed_at]));
	} catch {
		// GitHub API unavailable — project URLs are still listed, just without <lastmod>.
	}

	const projectEntries: UrlEntry[] = projects.map((entry) => ({
		loc: `/projects/${entry.id}`,
		lastmod: reposByName.get(entry.data.repo.toLowerCase()),
	}));

	const urls = [...staticEntries, ...projectEntries];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(url) => `  <url>
    <loc>${new URL(url.loc, base).href}</loc>${url.lastmod ? `\n    <lastmod>${new Date(url.lastmod).toISOString()}</lastmod>` : ''}
  </url>`,
	)
	.join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=0, s-maxage=3600',
		},
	});
};
