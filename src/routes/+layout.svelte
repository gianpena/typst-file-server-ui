<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import Auth from '@/components/Auth.svelte';
	const queryClient = new QueryClient();

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<QueryClientProvider client={queryClient}>
	<Auth>
		{@render children()}
	</Auth>
</QueryClientProvider>
