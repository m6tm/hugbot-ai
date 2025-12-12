<script lang="ts">
/**
 * Page principale du Chat AI
 */

import { onMount } from "svelte";
import { ChatArea, Sidebar } from "$lib/components";
import { chatStore } from "$lib/stores/chat.store";

let { data } = $props();

onMount(async () => {
	if (data.session?.user) {
		// D'abord restaurer les conversations du serveur vers local
		await chatStore.restore();
		// Puis synchroniser les modifications locales vers le serveur
		await chatStore.sync();
	}
});
</script>

<div class="app-container">
  <Sidebar session={data.session} />
  <ChatArea />
</div>

<style>
  .app-container {
    display: flex;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
</style>
