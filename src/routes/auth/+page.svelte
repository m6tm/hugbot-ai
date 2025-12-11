<script lang="ts">
  import { fade, fly, slide } from "svelte/transition";
  import { enhance } from "$app/forms";

  let { form, data } = $props();

  let isLogin = $state(true);
  let loading = $state(false);

  function toggleMode() {
    isLogin = !isLogin;
    if (form) form.error = undefined;
    errorMessage = "";
  }

  let errorMessage = $state("");

  async function handleGoogleLogin() {
    try {
      loading = true;
      errorMessage = "";
      const { error } = await data.supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (e: any) {
      console.error(e);
      errorMessage = e.message;
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>{isLogin ? "Connexion" : "Inscription"} - Hugbot</title>
</svelte:head>

<div class="auth-container">
  <div class="background-globes">
    <div class="globe globe-1"></div>
    <div class="globe globe-2"></div>
    <div class="globe globe-3"></div>
  </div>

  <div class="auth-card" in:fly={{ y: 20, duration: 600, delay: 100 }}>
    <!-- Header -->
    <div class="auth-header">
      <div class="logo-badge">
        <img
          src="/logo-hugbot-futuriste-carre-2-transparent.png"
          alt="Logo Hugbot"
          width="64"
          height="64"
        />
      </div>
      <h2>
        {isLogin ? "Bon retour !" : "Créer un compte"}
      </h2>
      <p class="subtitle">
        {isLogin
          ? "Votre assistant IA personnel vous attend."
          : "Rejoignez l'aventure Hugbot dès aujourd'hui."}
      </p>
    </div>

    <!-- Success Message -->
    {#if form?.success}
      <div class="message success" in:fly={{ y: -10, duration: 200 }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span>Inscription réussie ! Vérifiez vos emails.</span>
      </div>
    {/if}

    <!-- Error Message -->
    {#if form?.error || errorMessage}
      <div class="message error" in:fly={{ y: -10, duration: 200 }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{form?.error || errorMessage}</span>
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
      class="auth-form"
    >
      <div class="input-group">
        <label for="email-address">Adresse email</label>
        <div class="input-wrapper">
          <input
            id="email-address"
            name="email"
            type="email"
            autocomplete="email"
            required
            value={form?.email ?? ""}
            class="text-input"
            placeholder="vous@exemple.com"
          />
        </div>
      </div>

      <div class="input-group">
        <label for="password">Mot de passe</label>
        <div class="input-wrapper">
          <input
            id="password"
            name="password"
            type="password"
            autocomplete={isLogin ? "current-password" : "new-password"}
            required
            class="text-input"
            placeholder="••••••••"
          />
        </div>
      </div>

      {#if !isLogin}
        <div class="input-group" transition:slide={{ duration: 300 }}>
          <label for="confirm-password">Confirmer le mot de passe</label>
          <div class="input-wrapper">
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              required
              class="text-input"
              placeholder="••••••••"
            />
          </div>
        </div>
      {/if}

      <div class="actions">
        <button type="submit" disabled={loading} class="submit-btn primary">
          {#if loading}
            <div class="spinner"></div>
          {/if}
          <span>{isLogin ? "Se connecter" : "S'inscrire"}</span>
          {#if !loading}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          {/if}
        </button>

        <div class="divider">
          <span>Ou continuer avec</span>
        </div>

        <button
          type="button"
          disabled={loading}
          onclick={handleGoogleLogin}
          class="submit-btn google"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Google</span>
        </button>
      </div>

      <div class="footer-links">
        {#if isLogin}
          <span>Pas encore de compte ?</span>
        {/if}
        {#if !isLogin}
          <span>Déjà un compte ?</span>
        {/if}
        <button type="button" onclick={toggleMode} class="toggle-btn">
          {isLogin ? "Créer un compte" : "Se connecter"}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .auth-container {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-main);
    position: relative;
    /* overflow: hidden; removed to allow scrolling */
    padding: 30px 20px; /* Ensure space top/bottom */
    color: var(--text-main);
    transition:
      background-color 0.3s ease,
      color 0.3s ease;
  }

  /* Background Globes Animation matching theme colors */
  .background-globes {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;
  }

  .globe {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
    animation: blob-bounce 10s infinite ease-in-out;
  }

  .globe-1 {
    top: -10%;
    left: -10%;
    width: 50vh;
    height: 50vh;
    background: var(--color-primary);
    animation-delay: 0s;
  }

  .globe-2 {
    top: 20%;
    right: -10%;
    width: 60vh;
    height: 60vh;
    background: var(--color-accent);
    animation-delay: 2s;
  }

  .globe-3 {
    bottom: -20%;
    left: 20%;
    width: 50vh;
    height: 50vh;
    background: var(--color-primary-dark);
    animation-delay: 4s;
  }

  @keyframes blob-bounce {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
  }

  /* Auth Card */
  .auth-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 440px;
    margin: auto;
    padding: 40px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 24px;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(10px);
  }

  .auth-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .logo-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    color: white;
    margin-bottom: 24px;
    transition: transform 0.3s ease;
  }

  .logo-badge:hover {
    transform: scale(1.05);
  }

  h2 {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 12px;
    background: linear-gradient(
      135deg,
      var(--color-primary-dark) 0%,
      var(--color-accent) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global(.dark) h2 {
    background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    color: var(--text-muted);
    font-size: 15px;
    line-height: 1.5;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .input-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .text-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    background: var(--bg-input);
    color: var(--text-main);
    font-size: 15px;
    transition: all 0.2s ease;
    outline: none;
  }

  .text-input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background: var(--bg-card);
  }

  .submit-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(
      135deg,
      var(--color-primary) 0%,
      var(--color-accent) 100%
    );
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.2s ease;
    margin-top: 8px;
  }

  .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.4);
  }

  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .submit-btn.primary {
    background: linear-gradient(
      135deg,
      var(--color-primary) 0%,
      var(--color-accent) 100%
    );
    color: white;
  }

  .submit-btn.google {
    background: var(--bg-input);
    color: var(--text-main);
    border: 1px solid var(--border-color);
    margin-top: 0;
  }

  .submit-btn.google:hover {
    background: var(--bg-card);
    border-color: var(--color-primary);
  }

  .divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 16px 0;
    color: var(--text-muted);
    font-size: 13px;
  }

  .divider::before,
  .divider::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid var(--border-color);
  }

  .divider span {
    padding: 0 10px;
  }

  .footer-links {
    margin-top: 16px;
    text-align: center;
  }

  .toggle-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 14px;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .toggle-btn:hover {
    color: var(--color-primary);
    text-decoration: underline;
  }

  .message {
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 24px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .message.success {
    background: rgba(34, 197, 94, 0.1);
    color: #15803d;
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  :global(.dark) .message.success {
    color: #4ade80;
  }

  .message.error {
    background: rgba(239, 68, 68, 0.1);
    color: #b91c1c;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  :global(.dark) .message.error {
    color: #f87171;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
