import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { fetchPublicRepos, GITHUB_USER } from '../lib/github';
import { SITE_NAME } from '../lib/site';

export const GET: APIRoute = async (context) => {
	const projects = await getCollection('projects');

	let reposByName = new Map<string, string>();
	try {
		const repos = await fetchPublicRepos(GITHUB_USER);
		reposByName = new Map(repos.map((repo) => [repo.name.toLowerCase(), repo.created_at]));
	} catch {
		// GitHub API unavailable — items are still listed, just without a pubDate.
	}

	return rss({
		title: `${SITE_NAME} — Projects`,
		description: `Personal projects by ${SITE_NAME}.`,
		site: context.site ?? new URL('https://ssimo.dev'),
		trailingSlash: false,
		items: projects.map((entry) => {
			const createdAt = reposByName.get(entry.data.repo.toLowerCase());
			return {
				title: entry.data.title ?? entry.data.repo,
				description: entry.data.description ?? entry.data.summary,
				link: `/projects/${entry.id}`,
				categories: entry.data.tags,
				...(createdAt && { pubDate: new Date(createdAt) }),
			};
		}),
	});
};
