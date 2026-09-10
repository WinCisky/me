export function formatFinderDate(iso: string): string {
	const date = new Date(iso);
	const now = new Date();
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const startOfYesterday = new Date(startOfToday);
	startOfYesterday.setDate(startOfToday.getDate() - 1);
	const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

	if (date >= startOfToday) return `Today, ${time}`;
	if (date >= startOfYesterday) return `Yesterday, ${time}`;
	return date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
	});
}

export function formatFinderSize(kb: number): string {
	if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
	return `${kb} KB`;
}
