<script lang=ts>
    import { useQueryClient } from '@tanstack/svelte-query';

    const { content, path }: { content: string | undefined; path: string } = $props();
    const queryClient = useQueryClient();

    async function compile() {
        try {
            const response = await fetch('/api/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path })
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
            const { data } = await response.json();
            queryClient.setQueryData(['fileContents', path.replace(/\.typ$/, '.pdf')], data);
        } catch (e) {}
    }

    let decoded = $derived(content ? atob(content) : '');

    let pdfUrl: string | undefined = $state();

    $effect(() => {
        if (!decoded) {
            pdfUrl = undefined;
            return;
        }
        const url = URL.createObjectURL(
            new Blob([Uint8Array.from(decoded, (c) => c.charCodeAt(0))], {
                type: "application/pdf",
            }),
        );
        pdfUrl = url;

        return () => URL.revokeObjectURL(url);
    });
</script>

<div class="flex h-full w-full flex-col">
    {#if pdfUrl}
        <object data="{pdfUrl}#toolbar=0&navpanes=0&statusbar=0" type="application/pdf" title="PDF preview">
            <p>
                Your browser can't display this PDF.
                <a href={pdfUrl} download="document.pdf">Download it instead.</a>
            </p>
        </object>
    {:else}
        <div class="flex flex-1 w-full items-center justify-center">
            <span class="text-gray-400">No PDF yet — compile the file to see a preview.</span>
        </div>
    {/if}
</div>

<style>
    object {
        width: 100%;
        flex: 1;
        min-height: 0;
        border: none;
    }
</style>