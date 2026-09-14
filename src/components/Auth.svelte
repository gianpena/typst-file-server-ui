<script lang="ts">
	import { createQuery } from "@tanstack/svelte-query";
	import { onMount } from "svelte";


    let { children } = $props();
    let password: string = $state("");
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

    onMount(() => {
        password = window.prompt('Please enter the password.') ?? "";
    });

</script>

{#if authQuery.isLoading}
    <p>Loading...</p>
{:else if authQuery.isSuccess && authQuery.data}
    {@render children()}
{:else}
    <p>Forbidden</p>
{/if}

