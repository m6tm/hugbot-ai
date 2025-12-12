<script lang="ts">
/**
 * Page principale du Chat AI
 */

import { onMount } from "svelte";
import { ChatArea, Sidebar } from "$lib/components";
import { chatStore } from "$lib/stores/chat.store";

let { data } = $props();

onMount(() => {
	if (data.session?.user) {
		chatStore.sync();
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
