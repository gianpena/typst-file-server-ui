<script lang="ts">
	import FileTree from '@/components/FileTree.svelte';
	import FileViewer from '@/components/FileViewer.svelte';
	import type { FileTreeNode } from '@/types';

	const { data } = $props();

	let fileCurrentlySelected: string = $state('');

</script>

<div class="flex">
	<FileTree fileTree={data.files as FileTreeNode[]} bind:fileCurrentlySelected />
	{#if fileCurrentlySelected}
		<FileViewer path={fileCurrentlySelected} />
	{:else}
		<p>No file selected</p>
	{/if}
</div>