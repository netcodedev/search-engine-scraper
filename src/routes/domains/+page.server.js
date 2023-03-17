import { db } from '$lib/server/db';

export async function load() {
	const domains = (await db.query('SELECT * FROM domain'))[0].result;
	return {
		domains: domains.sort(urlSort)
	};
}

const urlSort = (a, b) => {
	a = a.domain.toLowerCase();
	b = b.domain.toLowerCase();
	return a < b ? -1 : a > b ? 1 : 0;
};
