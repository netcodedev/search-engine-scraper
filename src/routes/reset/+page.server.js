import { db } from '$lib/server/db';

export async function load() {
	await db.delete('domain');
	await db.delete('indexedPage');
	await db.delete('pageDomain');
	await db.delete('toIndex');
	await db.delete('waitingForIndexing');
	return {};
}
