<script>
	export let data;

	let search = '';
	$: search = search.toLowerCase();
</script>

<div>
	<div class="form-control">
		<input
			class="input input-bordered focus:outline-none bg-base-200"
			type="search"
			bind:value={search} />
	</div>
</div>
<div class="flex flex-wrap gap-3 m-5">
	{#each data.domains?.filter((x) => search.length == 0 || x.domain.includes(search)) ?? [] as domain}
		<div class="card card-compact w-64 bg-base-300">
			<div class="card-body">
				<a href="/domains/{domain.id.split(':')[1]}">{domain.domain}</a>
			</div>
		</div>
	{/each}
</div>
