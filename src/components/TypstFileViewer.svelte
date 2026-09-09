<script lang="ts">
    import CodeMirror from 'svelte-codemirror-editor';
    import { typst_lezer } from 'codemirror-lang-typst/lezer';
    import { useQueryClient } from '@tanstack/svelte-query';
    import { PDFify } from '@/shared';

    const { path, text = $bindable('') }: { path: string; text: string } = $props();
    const queryClient = useQueryClient();

    let editedText = $derived(text);
    let saving = $state(false);
    let saveError = $state(false);

    const isDirty = $derived(editedText !== text);

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
            await queryClient.invalidateQueries({ queryKey: ['fileContents', PDFify(path)] });
        } catch {
            saveError = true;
        } finally {
            saving = false;
        }
    }

    window.addEventListener('beforeunload', (event) => {
        if(isDirty) {
            event.preventDefault();
            event.returnValue = '';
        }
    });
</script>

<div class="flex h-screen w-full min-w-0 flex-col">
    <div class="flex items-center gap-2 border-b p-2">
        <button
            class="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
            onclick={save}
            disabled={!isDirty || saving}
        >
            {saving ? 'Saving...' : 'Save'}
        </button>
        {#if saveError}
            <span class="text-sm text-red-600">Failed to save file.</span>
        {:else if isDirty}
            <span class="text-sm text-gray-500">Unsaved changes</span>
        {/if}
    </div>
    <div class="min-h-0 flex-1 overflow-hidden">
        <CodeMirror
            bind:value={editedText}
            lang={typst_lezer()}
            styles={{ '&': { height: '100%' } }}
        />
    </div>
</div>
