<script lang="ts">
	import FileTree from '@/components/FileTree.svelte';
	import FileViewer from '@/components/FileViewer.svelte';
	import type { FileTreeNode } from '@/types';
	import { onMount } from 'svelte';

	const { data } = $props();

	let fileCurrentlySelected: string = $state('');
	let docUnavailable: boolean = $state(true);

	onMount(() => {
		const doc = document as Document & { prerendering?: boolean };
		docUnavailable = doc.prerendering ?? false;
	});
</script>

{#if !docUnavailable}
	<div class="flex h-screen overflow-hidden">
		<FileTree fileTree={data.files as FileTreeNode[]} bind:fileCurrentlySelected />
		{#if fileCurrentlySelected}
			<FileViewer path={fileCurrentlySelected} />
		{:else}
			<p>No file selected</p>
		{/if}
	</div>
{/if}