import { db } from '$lib/server/db';

export async function load({ params, url }) {
	const { id } = params;
	const domain = (await db.select(`domain:${id}`))[0];
	const pages = (
		await db.query(
			'SELECT title, url FROM indexedPage WHERE ->pageDomain->(domain WHERE id = $domain) ORDER BY title',
			{
				domain: `domain:${id}`
			}
		)
	)[0].result;
	const waitingForIndexing = (
		await db.query(
			'SELECT url FROM toIndex WHERE ->waitingForIndexing->(domain WHERE id=$domain) ORDER BY url',
			{
				domain: `domain:${id}`
			}
		)
	)[0].result;
	return {
		domain,
		indexedCount: pages.length,
		pages: pages.slice(0, 50),
		toIndexCount: waitingForIndexing.length,
		waitingForIndexing: waitingForIndexing.slice(0, 50),
		ip: url.searchParams.get('ip'),
		wfi: url.searchParams.get('wfi')
	};
}
