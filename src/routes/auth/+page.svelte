<script lang="ts">
import { fade, fly, slide } from "svelte/transition";
import { enhance } from "$app/forms";

let { form } = $props();

let isLogin = $state(true);
let loading = $state(false);

function toggleMode() {
	isLogin = !isLogin;
	if (form) form.error = undefined;
}
</script>

<svelte:head>
  <title>{isLogin ? "Connexion" : "Inscription"} - Hugbot</title>
</svelte:head>

<div
  class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-500"
>
  <!-- Animated Background Blobs -->
  <div
    class="absolute -top-[30%] -left-[10%] w-[70vh] h-[70vh] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-70 animate-blob bg-purple-300 dark:bg-purple-600/30"
  ></div>
  <div
    class="absolute top-[20%] -right-[10%] w-[70vh] h-[70vh] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-70 animate-blob animation-delay-2000 bg-indigo-300 dark:bg-indigo-600/30"
  ></div>
  <div
    class="absolute -bottom-[30%] left-[20%] w-[70vh] h-[70vh] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-70 animate-blob animation-delay-4000 bg-pink-300 dark:bg-pink-600/30"
  ></div>

  <!-- Glassmorphism Card -->
  <div
    class="relative w-full max-w-md p-8 mx-4 transition-all duration-300 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-10"
    in:fly={{ y: 20, duration: 600, delay: 100 }}
  >
    <!-- Header -->
    <div class="text-center mb-8">
      <div
        class="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-6 transform transition-transform hover:scale-105 duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-8 h-8 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
          />
          <path d="M4 12a10 10 0 0 1 10-10 10 10 0 0 1 10 10" />
          <path d="M9 12h.01" />
          <path d="M15 12h.01" />
          <path d="M12 16a4 4 0 0 1-4-4" />
          <path
            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
            opacity="0.2"
          />
        </svg>
      </div>
      <h2
        class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
      >
        {isLogin ? "Bon retour !" : "Créer un compte"}
      </h2>
      <p class="mt-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
        {isLogin
          ? "Votre assistant IA personnel vous attend."
          : "Rejoignez l'aventure Hugbot dès aujourd'hui."}
      </p>
    </div>

    <!-- Success Message -->
    {#if form?.success}
      <div
        class="bg-green-100/80 dark:bg-green-900/40 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 backdrop-blur-sm"
        in:fly={{ y: -10, duration: 200 }}
      >
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-green-600 dark:text-green-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-green-800 dark:text-green-200">
              Inscription réussie ! Vérifiez vos emails.
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Error Message -->
    {#if form?.error}
      <div
        class="bg-red-100/80 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 backdrop-blur-sm"
        in:fly={{ y: -10, duration: 200 }}
      >
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-red-600 dark:text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800 dark:text-red-200">
              {form.error}
            </p>
          </div>
        </div>
      </div>
    {/if}

    <form
      method="POST"
      action={isLogin ? "?/login" : "?/register"}
      use:enhance={() => {
        loading = true;
        return async ({ update }) => {
          loading = false;
          update();
        };
      }}
      class="space-y-6"
    >
      <div class="space-y-5">
        <div class="group">
          <label
            for="email-address"
            class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1"
            >Adresse email</label
          >
          <div class="relative">
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              value={form?.email ?? ""}
              class="block w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm group-hover:bg-white/80 dark:group-hover:bg-gray-900/80"
              placeholder="vous@exemple.com"
            />
          </div>
        </div>

        <div class="group">
          <label
            for="password"
            class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1"
            >Mot de passe</label
          >
          <div class="relative">
            <input
              id="password"
              name="password"
              type="password"
              autocomplete={isLogin ? "current-password" : "new-password"}
              required
              class="block w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm group-hover:bg-white/80 dark:group-hover:bg-gray-900/80"
              placeholder="••••••••"
            />
          </div>
        </div>

        {#if !isLogin}
          <div class="group" transition:slide={{ duration: 300 }}>
            <label
              for="confirm-password"
              class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1"
              >Confirmer le mot de passe</label
            >
            <div class="relative">
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                class="block w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm group-hover:bg-white/80 dark:group-hover:bg-gray-900/80"
                placeholder="••••••••"
              />
            </div>
          </div>
        {/if}
      </div>

      <div class="pt-2">
        <button
          type="submit"
          disabled={loading}
          class="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          {#if loading}
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          {/if}
          <span>{isLogin ? "Se connecter" : "S'inscrire"}</span>
          {#if !loading}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          {/if}
        </button>
      </div>

      <div class="flex items-center justify-between mt-6">
        <button
          type="button"
          onclick={toggleMode}
          class="w-full text-sm font-medium text-center text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-200"
        >
          {isLogin
            ? "Pas encore de compte ? Créer un compte"
            : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  /* Animation personnalisée pour les blobs (si non gérée par Tailwind) */
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }

  .animate-blob {
    animation: blob 7s infinite;
  }

  .animation-delay-2000 {
    animation-delay: 2s;
  }

  .animation-delay-4000 {
    animation-delay: 4s;
  }
</style>
