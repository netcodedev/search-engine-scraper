<script>
	export let pageCount;
	export let currentIndex;
	export let url;
	export let param = 'page';
	$: currentIndex = parseInt(currentIndex);
</script>

<div class="btn-group">
	{#if currentIndex > 1}
		<a href={`${url}?${param}=${(currentIndex - 1)}`} class="btn">Previous</a>
	{/if}
	{#if pageCount <= 10}
		{#each Array(pageCount) as _, i}
			<a
				href={`${url}?${param}=${(currentIndex + 1)}`}
				class="btn"
				class:btn-active={i + 1 == currentIndex}>
				{i + 1}
			</a>
		{/each}
	{:else}
		<a href={`${url}?${param}=1`} class="btn">1</a>
		{#if currentIndex < 5}
			{#each Array(Math.min(pageCount, 5)-1) as _, i}
				<a href={`${url}?${param}=${(i+2)}`} class="btn" class:btn-active={i + 2 == currentIndex}>{i+2}</a>
			{/each}
			<button class="btn btn-disabled">...</button>
		{:else if currentIndex > pageCount - 4}
			<button class="btn btn-disabled">...</button>
			{#each Array(4) as _, i}
				<a href={`${url}?${param}=${(pageCount-4+i)}`} class="btn" class:btn-active={pageCount-4+i == currentIndex}>{pageCount-4+i}</a>
			{/each}
		{:else}
			<button class="btn btn-disabled">...</button>
			{#each Array(5) as _, i}
				<a href={`${url}?${param}=${(currentIndex-2+i)}`} class="btn" class:btn-active={currentIndex-2+i == currentIndex}>{currentIndex-2+i}</a>
			{/each}
			<button class="btn btn-disabled">...</button>
		{/if}
		<a href={`${url}?${param}=${pageCount}`} class="btn" class:btn-active={pageCount == currentIndex}>{pageCount}</a>
	{/if}
	{#if currentIndex < pageCount}
		<a href={`${url}?${param}=${(currentIndex + 1)}`} class="btn">Next</a>
	{/if}
</div>
