<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	
	import { createQuery, QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';
	const queryClient = new QueryClient();

	let { children } = $props();
	let authenticated: boolean = $state(false);

	onMount(() => {
		const enteredPassword = window.prompt("Please enter the password to continue.");
		const passwordMatchQuery = createQuery(() => ({
			queryKey: ["password"],
			queryFn: () => {
				
			}
		}));
	});

</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{#if authenticated}
	<QueryClientProvider client={queryClient}>
		{@render children()}
	</QueryClientProvider>
{:else}
	<p>Forbidden</p>
{/if}