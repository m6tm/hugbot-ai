<script lang="ts">
  /**
   * Page principale du Chat AI
   */
  import { ChatArea, Sidebar } from "$lib/components";

  let { data } = $props();
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
