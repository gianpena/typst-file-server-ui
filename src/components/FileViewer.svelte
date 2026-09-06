<script lang="ts">
    import { Highlight } from 'svelte-highlight';
    import typst from "svelte-highlight/languages/typst";
    import github from "svelte-highlight/styles/github";
    import { createQuery, useQueryClient } from '@tanstack/svelte-query';
    import { getFileType } from '@/shared';
    let { path } = $props();
    let fileType: string | undefined = $derived(getFileType(path));

    const queryClient = useQueryClient();

    const fileContentsQuery = $derived.by(() => {
        return createQuery(() => ({
            queryKey: ['fileContents', path],
            queryFn: async () => {
                const response = await fetch(`/api/file?path=${encodeURIComponent(path)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch file contents');
                }
                const type = getFileType(path);
                if (type && type === 'pdf') {
                    const blob = await response.blob();
                    return { type: 'pdf' as const, url: `${URL.createObjectURL(blob)}#toolbar=0&navpanes=0` };
                }
                return { type: 'text' as const, text: await response.text() };
            }
        }));
    });

    $effect(() => {
        const data = fileContentsQuery.data;
        return () => {
            if (data?.type === 'pdf') {
                URL.revokeObjectURL(data.url.split('#')[0]);
            }
        };
    });

    let editedText = $state('');
    let saving = $state(false);
    let saveError = $state(false);
    let compiling = $state(false);
    let compileError = $state('');
    let highlighted: HTMLDivElement | undefined = $state();
    let editor: HTMLTextAreaElement | undefined = $state();

    $effect(() => {
        const data = fileContentsQuery.data;
        if (data?.type === 'text') {
            editedText = data.text;
        }
    });

    const isDirty = $derived(
        fileContentsQuery.data?.type === 'text' && editedText !== fileContentsQuery.data.text
    );

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

{#if fileContentsQuery.isLoading}
    <span class="flex h-screen items-center justify-center">Loading...</span>
{:else if fileContentsQuery.isError}
    <span class="flex h-screen items-center justify-center">There was a problem loading this file's contents.</span>
{:else if fileContentsQuery.isSuccess}
    {#if fileType === 'pdf'}
        <embed src={fileContentsQuery.data.url} type="application/pdf" class="h-screen w-full" />
    {:else if fileType === 'typ'}
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
    {/if}
{/if}
