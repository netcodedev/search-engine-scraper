<script>
	import { Pagination } from '$lib/components';

	export let data;
</script>

<div class="flex flex-col gap-3 m-5">
	<div class="card bg-base-200">
		<div class="card-body">
			<h1 class="text-2xl">{data.domain.domain}</h1>
		</div>
	</div>

	<div class="flex gap-3">
		<div class="w-1/2 card card-bordered bg-base-200">
			<div class="card-body">
				<h2 class="card-title">Indexed urls ({data.indexedCount}):</h2>
				{#each data.pages as page}
					<a class="link link-primary" href={page.url}>{page.title}</a>
				{/each}
				{#if data.pages.length === 0}
					<p class="text-base-content text-opacity-50">No pages indexed yet.</p>
				{/if}
				{#if data.pages.length < data.indexedCount}
					<div class="flex justify-center">
						<div class="btn-group">
							<Pagination
								pageCount={Math.ceil(data.indexedCount / data.pages.length)}
								currentIndex={data.ip ?? 1}
								url="/domains/{data.domain.id.split(':')[1]}"
								param="ip" />
						</div>
					</div>
				{/if}
			</div>
		</div>
		<div class="w-1/2 card card-bordered bg-base-200">
			<div class="card-body">
				<h2 class="card-title">Waiting for indexing ({data.toIndexCount}):</h2>
				{#each data.waitingForIndexing as page}
					<a class="link link-primary" href={page.url}>{page.url}</a>
				{/each}
				{#if data.waitingForIndexing.length === 0}
					<p class="text-base-content text-opacity-50" />
				{/if}
				{#if data.waitingForIndexing.length < data.toIndexCount}
					<div class="flex justify-center">
						<div class="btn-group">
							<Pagination
								pageCount={Math.ceil(data.toIndexCount / data.waitingForIndexing.length)}
								currentIndex={data.wfi ?? 1}
								url="/domains/{data.domain.id.split(':')[1]}"
								param="wfi" />
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
