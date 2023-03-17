import { db } from '$lib/server/db';
import jsTokens from 'js-tokens';
import lemmatizer from 'node-lemmatizer';
import cheerio from 'cheerio';

let crawling = false;

export async function startCrawler() {
	if (!crawling) {
		crawl();
	}
}

async function crawl() {
	crawling = true;
	const toIndex = (
		await db.query(
			'SELECT * FROM toIndex WHERE $excludes NOTINSIDE type::string(url) ORDER BY createdAt ASC LIMIT 25',
			{
				excludes: 'github'
			}
		)
	)[0].result;
	for (let { url, createdAt } of toIndex) {
		console.log('crawling', url, new Date(createdAt).toISOString());
		await crawlPage(url);
	}
	console.log('done');
	crawling = false;
}

async function crawlPage(url) {
	const indexUrl = await validateUrl(url);
	if (!indexUrl) {
		deleteToIndex(url);
		return;
	}
	if (indexUrl == 'https://netcode.dev/') return;
	fetch(indexUrl, { compress: false })
		.then((res) => {
			if (res.ok) {
				res.text().then(async (body) => {
					if (!body.toLowerCase().trim().startsWith('<!doctype html')) {
						deleteToIndex(url);
						return;
					}
					const document = cheerio.load(body);
					const title = document('title').text();
					const docBody = document('body');

					let tokens = [];
					for (let token of jsTokens(docBody.text())) {
						if (token.value != ' ' && !tokens.includes(token.value)) {
							let lemmatized = lemmatizer.only_lemmas(token.value.toLowerCase());
							if (lemmatized[lemmatized.length - 1]) {
								tokens = [...tokens, lemmatized[lemmatized.length - 1]];
							}
						}
					}

					const domain = await checkDomain(indexUrl);

					const indexedPage = await db.create('indexedPage', {
						url: indexUrl,
						tokens,
						title,
						createdAt: Date.now()
					});
					await db.query(
						`RELATE ${indexedPage.id}->pageDomain->${domain.id} SET createdAt = time::now()`
					);

					let urls = extractUrls(document, indexUrl);

					urls = Array.from(urls);
					for (let checkUrl of urls) {
						await addToIndex(checkUrl);
					}

					deleteToIndex(url);
				});
			}
		})
		.catch((error) => console.error(indexUrl, error.message));
}

async function addToIndex(url) {
	if (!url) return;
	url = url.split('?')[0];
	const domain = await checkDomain(url);
	let existing = await db.query(
		'SELECT <-pageDomain<-(indexedPage WHERE url = $url) AS pdip FROM $domain',
		{
			domain: domain.id,
			url
		}
	);
	let waitingForIndex = await db.query(
		'SELECT <-waitingForIndexing<-(toIndex WHERE url = $url) AS wfi FROM $domain',
		{
			domain: domain.id,
			url
		}
	);
	if (existing[0].result[0].pdip.length == 0 && waitingForIndex[0].result[0].wfi.length == 0) {
		console.log('adding to index', url);
		const toIndex = await db.create('toIndex', {
			url,
			createdAt: Date.now()
		});
		await db.query(
			`RELATE ${toIndex.id}->waitingForIndexing->${domain.id} SET createdAt = time::now()`
		);
	}
}

function extractUrls(document, url) {
	let urls = new Set();
	document('body a').each((i, el) => {
		const link = document(el).attr('href');
		const linkUrl = new URL(link, url);
		if (!link) return;
		if (link.startsWith('#')) return;
		if (link.startsWith('mailto:')) return;
		if (linkUrl.protocol == 'ftp:') return;
		if (linkUrl.protocol != 'http:' && linkUrl.protocol != 'https:') {
			urls.add(linkUrl.href);
		}
		if (linkUrl.protocol == 'http:' || linkUrl.protocol == 'https:') {
			urls.add(linkUrl.href);
		}
	});
	return urls;
}

async function checkDomain(url) {
	url = new URL(url);
	let domain = await db.query('SELECT * FROM domain WHERE domain = $url', {
		url: url.hostname
	});
	if (domain[0].result.length > 0) {
		return domain[0].result[0];
	}
	if (domain[0].result.length == 0) {
		return await db.create('domain', {
			domain: url.hostname,
			createdAt: Date.now()
		});
	}
}

async function deleteToIndex(url) {
	await db.query(`DELETE toIndex WHERE url = $url`, {
		url
	});
}

async function validateUrl(url) {
	let indexUrl;
	let urlPattern = /^http/gi;
	if (!urlPattern.test(url)) {
		indexUrl = 'https://' + url;
	} else {
		indexUrl = url;
	}
	if (!isValidHttpUrl(url)) {
		console.log(url, 'is not a valid url');
		return false;
	}
	let existing = await db.query('SELECT url FROM indexedPage WHERE url = $url', {
		url: indexUrl
	});
	if (existing[0].result.length > 0) {
		console.log(url, 'already indexed');
		return false;
	}
	if (
		indexUrl.includes('web.archive.org') ||
		indexUrl.includes('wikipedia.org') ||
		indexUrl.includes('wikimedia.org')
	) {
		return false;
	}
	return indexUrl;
}

function isValidHttpUrl(string) {
	let url;
	try {
		url = new URL(string);
	} catch (_) {
		return false;
	}
	return url.protocol === 'http:' || url.protocol === 'https:';
}
