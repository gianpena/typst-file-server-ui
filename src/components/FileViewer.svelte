<script lang="ts">
    import { createQuery } from '@tanstack/svelte-query';
	import TypstFileViewer from "@/components/TypstFileViewer.svelte";
    import PDFViewer from "@/components/PDFViewer.svelte";
    import { PDFify } from '@/shared';

    let { path }: { path: string } = $props();

    const text = createQuery(() => ({
        queryKey: ['fileContents', path],
        queryFn: async () => {
            const response = await fetch(`/api/file?path=${encodeURIComponent(path)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch file contents');
            }
            return response.text();
        }
    }));

    const pdfPath = $derived(PDFify(path));

    const pdf = createQuery(() => ({
        queryKey: ['fileContents', pdfPath],
        queryFn: async () => {
            const response = await fetch('/api/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path })
            });
            if (!response.ok) {
                throw new Error('Failed to compile PDF');
            }
            const { data } = await response.json();
            return data as string;
        },
        retry: false
    }));

    let splitPercent = $state(50);
    let container: HTMLDivElement | undefined = $state();

    function startResize(event: PointerEvent) {
        event.preventDefault();
        (event.target as Element).setPointerCapture(event.pointerId);
        const onMove = (e: PointerEvent) => {
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const percent = ((e.clientX - rect.left) / rect.width) * 100;
            splitPercent = Math.min(80, Math.max(20, percent));
        };
        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    }

</script>

{#if text.isLoading}
    <div class="flex h-screen w-full items-center justify-center">
        <span class="text-gray-500">Loading...</span>
    </div>
{:else if text.isError}
    <div class="flex h-screen w-full items-center justify-center">
        <span class="text-red-600">Failed to load file contents.</span>
    </div>
{:else if text.isSuccess}
    <div bind:this={container} class="flex h-screen w-full">
        <div class="relative min-w-0 overflow-hidden border-r border-gray-300" style:width="{splitPercent}%">
            <TypstFileViewer {path} bind:text={text.data} />
            <button
                class="absolute inset-y-0 right-0 w-1 cursor-col-resize"
                aria-label="Resize panels"
                onpointerdown={startResize}
            ></button>
        </div>
        <div class="min-w-0 flex-1 overflow-hidden">
            <PDFViewer content={pdf.isSuccess ? pdf.data : undefined} />
        </div>
    </div>
{/if}
