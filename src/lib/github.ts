export const GITHUB_USER = 'WinCisky';

export interface Repo {
	name: string;
	html_url: string;
	description: string | null;
	pushed_at: string;
	fork: boolean;
}

interface CacheEntry {
	etag: string | null;
	fetchedAt: number;
	repos: Repo[];
}

const TTL_MS = 60 * 60 * 1000;

// Deno Deploy has a read-only filesystem: the cache lives in memory, per isolate.
let cache: CacheEntry | null = null;
let inFlight: Promise<Repo[]> | null = null;

function readToken(): string | undefined {
	const denoEnv = (globalThis as { Deno?: { env?: { get(key: string): string | undefined } } }).Deno?.env;
	try {
		if (denoEnv) return denoEnv.get('GITHUB_TOKEN');
	} catch {
		// --allow-env permission not granted
	}
	return typeof process !== 'undefined' ? process.env?.GITHUB_TOKEN : undefined;
}

async function revalidate(user: string): Promise<Repo[]> {
	const url = `https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=pushed&direction=desc&type=owner`;
	const token = readToken();
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
		'User-Agent': 'minor-metal',
	};
	if (token) headers.Authorization = `Bearer ${token}`;
	// 304 responses do not count against the rate limit.
	if (cache?.etag) headers['If-None-Match'] = cache.etag;

	const res = await fetch(url, { headers });

	if (res.status === 304 && cache) {
		cache.fetchedAt = Date.now();
		return cache.repos;
	}

	if (!res.ok) {
		if (cache) return cache.repos;
		throw new Error(`GitHub API ${res.status}`);
	}

	const data: Repo[] = await res.json();
	const repos = data
		.filter((repo) => !repo.fork)
		.sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at));

	cache = { etag: res.headers.get('etag'), fetchedAt: Date.now(), repos };

	return repos;
}

export async function fetchPublicRepos(user: string): Promise<Repo[]> {
	if (cache && Date.now() - cache.fetchedAt < TTL_MS) return cache.repos;

	// Avoids duplicate requests when several HTTP requests arrive at once.
	inFlight ??= revalidate(user).finally(() => {
		inFlight = null;
	});

	return inFlight;
}
