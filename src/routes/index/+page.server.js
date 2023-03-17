import { startCrawler } from '$lib/server/crawler';
import { db } from '$lib/server/db';

export async function load() {
	startCrawler();
	const toIndex = (
		await db.query(
			'SELECT * FROM toIndex WHERE $excludes NOTINSIDE type::string(url) ORDER BY createdAt ASC LIMIT 25',
			{
				excludes: 'github'
			}
		)
	)[0].result;
	deleteDoubles(toIndex);
	return {
		toIndex
	};
}

async function deleteDoubles(toIndex) {
	let urls = [];
	for (let { id, url } of toIndex) {
		if (urls.includes(url)) {
			if (url.includes('atom')) console.log('deleting', url);
			await db.delete(id);
		} else {
			urls.push(url);
		}
	}
}
