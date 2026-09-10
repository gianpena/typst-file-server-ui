<script lang=ts>

    const { content }: { content: string | undefined } = $props();

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
            <span class="text-gray-400">No PDF available. Did it compile unsuccessfully?</span>
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