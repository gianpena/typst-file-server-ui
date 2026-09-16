<script lang="ts">
    import { tick } from 'svelte';
    import { FilePlus } from 'lucide-svelte';

    let { onSubmit }: { onSubmit?: (value: string) => void } = $props();

    let isTyping: boolean = $state(false);
    let inputElement: HTMLInputElement | undefined = $state();

    function escapeKey(event: KeyboardEvent) {
        if(event.key === "Escape") {
            document.removeEventListener("keydown", escapeKey);
            isTyping = false;
        }
    }

    async function startTyping() {
        isTyping = true;
        await tick();
        inputElement?.focus();
        document.addEventListener("keydown", escapeKey);
    }

    function stopTyping() {
        isTyping = false;
        document.removeEventListener("keydown", escapeKey);
    }

    function submit(event: KeyboardEvent) {
        if(event.key === "Enter") {
            onSubmit?.((event.target as HTMLInputElement).value);
            stopTyping();
        }
    }
</script>

<div class="flex flex-col gap-1 {isTyping ? "" : "items-end"}">
    {#if isTyping}
        <input bind:this={inputElement} onblur={stopTyping} onkeydown={submit} id="path-input" type="text" class="border-solid border-1 p-1 rounded-sm">
    {:else}
        <button onclick={startTyping}>
            <FilePlus />
        </button>
    {/if}
</div>