<script>
	export let data;

	const urlSort = (a, b) => {
		a = a.url.toLowerCase();
		b = b.url.toLowerCase();
		return a < b ? -1 : a > b ? 1 : 0;
	};
</script>

<h1>{data.toIndex.length} urls are waiting for indexation</h1>

<div>
	{#each data.toIndex.sort(urlSort) as url}
		{url.url}
		<br />
	{/each}
</div>
