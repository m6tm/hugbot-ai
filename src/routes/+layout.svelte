<script lang="ts">
import "../app.css";

import { onMount } from "svelte";
import { invalidate } from "$app/navigation";
import { chatStore, settingsStore, themeStore } from "$lib/stores";

let { children, data } = $props();
let { session, supabase } = $derived(data);

onMount(() => {
	themeStore.init();
	settingsStore.init();
	chatStore.init();

	const {
		data: { subscription },
	} = supabase.auth.onAuthStateChange((_event, _session) => {
		if (_session?.expires_at !== session?.expires_at) {
			invalidate("supabase:auth");
		}
	});

	return () => subscription.unsubscribe();
});
</script>

<svelte:head>
  <title>Hugbot - Assistant Intelligent</title>
  <meta
    name="description"
    content="Hugbot - Votre assistant IA intelligent pour repondre a toutes vos questions"
  />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div id="app">
  {@render children()}
</div>

<style>
  #app {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
