<script lang="ts">
	import { createQuery } from "@tanstack/svelte-query";


    let { children } = $props();
    let password: string = $state("");
    let form: HTMLFormElement | undefined = $state();

    const authQuery = createQuery(() => ({
        queryKey: ["passwordMatch", password],
        queryFn: async () => {
            if(!password) return false;
            const response = await fetch("/api/auth", {
                method: "POST",
                body: JSON.stringify({ password })
            });
            return response.ok;
        }
    }));

    $effect(() => {
        if(!form) return;
        form.onsubmit = (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            password = formData.get("pwd") as string;
        };
    });

</script>

{#snippet password_form(options: { error?: string, loading_message?: string } = {})}
    {const {error, loading_message} = options;}

    <form bind:this={form} class="flex flex-col gap-2 items-center justify-center w-screen h-screen pb-24">
        <p class="text-gray-500">Please enter your password.</p>
        <input value={password} name="pwd" class="p-2 rounded-sm border-solid border-2 border-gray-500 focus:outline-none" type="text">
        {#if loading_message}
            <p class="text-gray-500">{loading_message}</p>
        {/if}
        {#if error}
            <p class="text-red-500">{error}</p>
        {/if}
    </form>
{/snippet}

{#if authQuery.isSuccess}
    {#if authQuery.data}
        {@render children()}
    {:else}
        {@render password_form({ error: password && "Incorrect password." })}
    {/if}
{:else if authQuery.isError}
    {@render password_form({ error: "Something went wrong while authenticating you. Try again later." })}
{:else if authQuery.isLoading}
    {@render password_form({ loading_message: password && "Authenticating..." })}
{/if}