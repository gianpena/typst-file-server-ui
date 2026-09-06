<script lang="ts">
	import type { FileTreeNode, Directory } from '@/types';
	import { Folder, FolderOpen } from 'lucide-svelte';
	import { extractBasename } from '@/shared';
	
	let {
		fileTree: fileTreeObj,
		fileCurrentlySelected = $bindable()
	}: { fileTree: FileTreeNode[]; fileCurrentlySelected: string } = $props();
	let fileTree: FileTreeNode[] = $state([]);
	$effect(() => {
		fileTree = fileTreeObj;
	});

	let sidebarWidth: number = $state(256);

	function startResize(event: PointerEvent) {
		event.preventDefault();
		
		const startX = event.clientX;
		const startWidth = sidebarWidth;

		function onMove(e: PointerEvent) {
			sidebarWidth = Math.min(Math.max(startWidth + e.clientX - startX, 200), 600);
		}
		function onUp() {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
		}
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
	}

	function isDir(node: FileTreeNode): node is Directory {
		return 'children' in node;
	}

	function toggleDir(node: Directory) {
		node.collapsed = !node.collapsed;
	}

	function selectFile(node: FileTreeNode) {
		for (const n of fileTree) deselect(n);
		if (!isDir(node)) node.selected = true;
		fileCurrentlySelected = node.name;
	}

	function deselect(node: FileTreeNode) {
		if (isDir(node)) {
			for (const child of node.children) deselect(child);
		} else {
			node.selected = false;
		}
	}

	function anySelected(node: FileTreeNode): boolean {
		if (isDir(node)) {
			return node.children.some(anySelected);
		} else {
			return node.selected;
		}
	}
</script>

{#snippet treeNode(node: FileTreeNode, depth: number)}
	{#if isDir(node)}
		<button
			class="flex w-full items-center gap-1 rounded px-2 py-1 text-left hover:bg-gray-200"
			style:padding-left="{depth * 1.25 + 0.25}rem"
			onclick={() => toggleDir(node)}
		>
			{#if node.collapsed}
				<Folder class="size-3" />
			{:else}
				<FolderOpen class="size-3" />
			{/if}
			<span>{extractBasename(node.name)}</span>
		</button>
		{#if !node.collapsed}
			{#each node.children as child (child.name)}
				{@render treeNode(child, depth + 1)}
			{/each}
		{/if}
	{:else}
		<button
			class="flex w-full items-center gap-1 rounded px-2 py-1 text-left hover:bg-gray-200"
			class:bg-blue-200={node.selected}
			style:padding-left="{depth * 1.25 + 1.25}rem"
			onclick={() => selectFile(node)}
		>
			<span>{extractBasename(node.name)}</span>
		</button>
	{/if}
{/snippet}

<div
	class="sticky top-0 relative h-screen shrink-0 overflow-x-hidden border border-gray-300 bg-gray-50 p-2 text-sm"
	style:width="{sidebarWidth}px"
>
	{#each fileTree as node (node.name)}
		{@render treeNode(node, 0)}
	{:else}
		<p class="text-gray-500">No files found.</p>
	{/each}
	<button
		class="absolute inset-y-0 right-0 w-1 cursor-col-resize"
		aria-label="Resize sidebar"
		onpointerdown={startResize}
	></button>
</div>
