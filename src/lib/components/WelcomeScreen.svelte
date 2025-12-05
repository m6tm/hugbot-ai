<script lang="ts">
  /**
   * Composant WelcomeScreen - Ecran d'accueil
   */
  import { chatStore } from "$lib/stores";
  import ModelSelector from "./ModelSelector.svelte";

  const suggestions = [
    {
      icon: "code",
      title: "Aide au code",
      description: "Ecrivez du code Python pour resoudre un algorithme",
    },
    {
      icon: "lightbulb",
      title: "Idees creatives",
      description: "Suggerez-moi des idees pour un projet innovant",
    },
    {
      icon: "book",
      title: "Apprentissage",
      description: "Expliquez-moi les bases du machine learning",
    },
    {
      icon: "message",
      title: "Conversation",
      description: "Aidez-moi a rediger un email professionnel",
    },
  ];

  async function handleSuggestionClick(description: string) {
    const conversation = await chatStore.createConversation();
    if (conversation) {
      setTimeout(() => {
        chatStore.sendMessage(description);
      }, 100);
    }
  }
</script>

<div class="welcome-screen">
  <div class="welcome-content">
    <div class="logo">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M15 13v2" />
        <path d="M9 13v2" />
      </svg>
    </div>

    <h1>Bienvenue sur Chat AI</h1>
    <p class="subtitle">
      Votre assistant IA intelligent. Posez-moi n'importe quelle question!
    </p>

    <div class="model-selector-wrapper">
      <ModelSelector />
    </div>

    <div class="suggestions-grid">
      {#each suggestions as suggestion}
        <button
          class="suggestion-card"
          onclick={() => handleSuggestionClick(suggestion.description)}
        >
          <div class="suggestion-icon">
            {#if suggestion.icon === "code"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            {:else if suggestion.icon === "lightbulb"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
                />
                <path d="M9 18h6" />
                <path d="M10 22h4" />
              </svg>
            {:else if suggestion.icon === "book"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"
                />
              </svg>
            {:else}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                />
              </svg>
            {/if}
          </div>
          <div class="suggestion-text">
            <span class="suggestion-title">{suggestion.title}</span>
            <span class="suggestion-desc">{suggestion.description}</span>
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .welcome-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 32px;
    overflow-y: auto;
  }

  .welcome-content {
    text-align: center;
    max-width: 800px;
  }

  .logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 24px;
    color: white;
    margin-bottom: 24px;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  h1 {
    font-size: 36px;
    font-weight: 700;
    color: white;
    margin: 0 0 12px;
    background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    font-size: 18px;
    color: #9ca3af;
    margin: 0 0 32px;
  }

  .model-selector-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 48px;
  }

  .suggestions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 640px) {
    .suggestions-grid {
      grid-template-columns: 1fr;
    }
  }

  .suggestion-card {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
  }

  .suggestion-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(102, 126, 234, 0.3);
    transform: translateY(-4px);
    box-shadow: 0 10px 40px rgba(102, 126, 234, 0.15);
  }

  .suggestion-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.2) 0%,
      rgba(118, 75, 162, 0.2) 100%
    );
    border-radius: 12px;
    color: #667eea;
    flex-shrink: 0;
  }

  .suggestion-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .suggestion-title {
    font-size: 15px;
    font-weight: 600;
    color: #e5e7eb;
  }

  .suggestion-desc {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.4;
  }
</style>
