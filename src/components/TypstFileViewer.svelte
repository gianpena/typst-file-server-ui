<script lang="ts">
    import { Highlight } from 'svelte-highlight';
    import typst from "svelte-highlight/languages/typst";
    import github from "svelte-highlight/styles/github";
    import { useQueryClient } from '@tanstack/svelte-query';

    let { path, text }: { path: string; text: string } = $props();

    const queryClient = useQueryClient();

    let editedText = $state('');
    let saving = $state(false);
    let saveError = $state(false);
    let compiling = $state(false);
    let compileError = $state('');
    let highlighted: HTMLDivElement | undefined = $state();
    let editor: HTMLTextAreaElement | undefined = $state();

    $effect(() => {
        editedText = text;
    });

    const isDirty = $derived(editedText !== text);

    function syncScroll() {
        if (highlighted && editor) {
            highlighted.scrollTop = editor.scrollTop;
            highlighted.scrollLeft = editor.scrollLeft;
        }
    }

    async function save() {
        saving = true;
        saveError = false;
        try {
            const response = await fetch('/api/file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path, contents: editedText })
            });
            if (!response.ok) {
                throw new Error('Failed to save file');
            }
            await queryClient.invalidateQueries({ queryKey: ['fileContents', path] });
        } catch {
            saveError = true;
        } finally {
            saving = false;
        }
    }

    async function compile() {
        compiling = true;
        compileError = '';
        try {
            const response = await fetch('/api/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path })
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }

        } catch (e) {
            compileError = e instanceof Error ? e.message : 'Compilation failed';
        } finally {
            compiling = false;
        }
    }
</script>

<svelte:head>
    {@html github}
</svelte:head>

<div class="flex h-screen w-full min-w-0 flex-col">
    <div class="flex items-center gap-2 border-b p-2">
        <button
            class="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
            onclick={save}
            disabled={!isDirty || saving}
        >
            {saving ? 'Saving...' : 'Save'}
        </button>
        <button
            class="rounded bg-green-600 px-3 py-1 text-sm text-white disabled:opacity-50"
            onclick={compile}
            disabled={isDirty || compiling}
        >
            {compiling ? 'Compiling...' : 'Compile'}
        </button>
        {#if compileError}
            <span class="text-sm text-red-600">{compileError}</span>
        {/if}
        {#if saveError}
            <span class="text-sm text-red-600">Failed to save file.</span>
        {:else if isDirty}
            <span class="text-sm text-gray-500">Unsaved changes</span>
        {/if}
    </div>
    <div class="relative min-h-0 flex-1">
        <div
            bind:this={highlighted}
            class="absolute inset-0 overflow-auto font-mono text-sm leading-normal [&_code]:!m-0 [&_code]:!block [&_code]:!overflow-visible [&_code]:!bg-transparent [&_code]:!p-0 [&_code]:font-mono [&_code]:text-sm [&_code]:leading-normal [&_code]:whitespace-pre [&_pre]:!m-0 [&_pre]:!overflow-visible [&_pre]:!p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-normal [&_pre]:whitespace-pre"
        >
            <Highlight language={typst} code={editedText.endsWith('\n') ? editedText + ' ' : editedText} />
        </div>
        <textarea
            bind:this={editor}
            bind:value={editedText}
            onscroll={syncScroll}
            spellcheck="false"
            class="absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent p-4 font-mono text-sm leading-normal whitespace-pre text-transparent caret-black outline-none"
        ></textarea>
    </div>
</div>
