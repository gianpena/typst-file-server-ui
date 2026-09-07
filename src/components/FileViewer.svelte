<script lang="ts">
    import { createQuery } from '@tanstack/svelte-query';
    import { getFileType } from '@/shared';
    import TypstFileViewer from './TypstFileViewer.svelte';
    let { path } = $props();
    let fileType: string | undefined = $derived(getFileType(path));

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

</script>

{#if fileContentsQuery.isLoading}
    <span class="flex h-screen items-center justify-center">Loading...</span>
{:else if fileContentsQuery.isError}
    <span class="flex h-screen items-center justify-center">There was a problem loading this file's contents.</span>
{:else if fileContentsQuery.isSuccess}
    {#if fileType === 'pdf'}
        <embed src={fileContentsQuery.data.url} type="application/pdf" class="h-screen w-full" />
    {:else if fileType === 'typ' && fileContentsQuery.data.type === 'text'}
        <TypstFileViewer {path} text={fileContentsQuery.data.text} />
    {/if}
{/if}
