<script lang="ts">
  import "../app.css";

  import { onMount } from "svelte";
  import { chatStore, themeStore } from "$lib/stores";

  let { children } = $props();

  onMount(() => {
    themeStore.init();
    chatStore.init();
  });
</script>

<svelte:head>
  <title>Chat AI - Assistant Intelligent</title>
  <meta
    name="description"
    content="Chat AI - Votre assistant IA intelligent pour repondre a toutes vos questions"
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
