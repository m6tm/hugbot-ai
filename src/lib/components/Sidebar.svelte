<script lang="ts">
  /**
   * Composant Sidebar - Liste des conversations et actions
   */
  import { chatStore, currentConversation, themeStore } from "$lib/stores";
  import ConversationItem from "./ConversationItem.svelte";
  import IconButton from "./ui/IconButton.svelte";

  let isCollapsed = $state(false);
  let searchQuery = $state("");
  let showUserMenu = $state(false);

  const filteredConversations = $derived(
    $chatStore.conversations.filter((conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  async function handleNewChat() {
    await chatStore.createConversation();
  }

  function toggleSidebar() {
    isCollapsed = !isCollapsed;
  }

  function toggleUserMenu() {
    showUserMenu = !showUserMenu;
  }

  function handleClearAllConversations() {
    // A implementer si necessaire
    showUserMenu = false;
  }
</script>

<aside class="sidebar" class:collapsed={isCollapsed}>
  <div class="sidebar-header">
    <IconButton
      icon="menu"
      onclick={toggleSidebar}
      ariaLabel={isCollapsed ? "Ouvrir le menu" : "Fermer le menu"}
    />

    {#if !isCollapsed}
      <button
        class="new-chat-btn"
        onclick={handleNewChat}
        aria-label="Nouvelle conversation"
      >
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
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span>Nouveau chat</span>
      </button>
    {:else}
      <button
        class="new-chat-btn-icon"
        onclick={handleNewChat}
        aria-label="Nouvelle conversation"
      >
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
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    {/if}
  </div>

  {#if !isCollapsed}
    <div class="search-container">
      <svg
        class="search-icon"
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
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        placeholder="Rechercher..."
        bind:value={searchQuery}
        class="search-input"
      />
    </div>

    <nav class="conversations-list">
      {#if filteredConversations.length === 0}
        <div class="empty-state">
          <p>Aucune conversation</p>
          <p class="hint">Commencez par creer un nouveau chat</p>
        </div>
      {:else}
        {#each filteredConversations as conversation (conversation.id)}
          <ConversationItem
            {conversation}
            isActive={$currentConversation?.id === conversation.id}
          />
        {/each}
      {/if}
    </nav>

    <div class="sidebar-footer">
      <div
        class="user-info"
        onclick={toggleUserMenu}
        onkeydown={(e) => e.key === "Enter" && toggleUserMenu()}
        onfocusout={() => setTimeout(() => (showUserMenu = false), 200)}
        role="button"
        tabindex="0"
      >
        <div class="avatar">
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
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 1 0-16 0" />
          </svg>
        </div>
        <span class="username">Utilisateur</span>
        <svg
          class="chevron"
          class:open={showUserMenu}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>

        {#if showUserMenu}
          <div class="user-menu">
            <button class="menu-item" onclick={() => themeStore.toggle()}>
              {#if $themeStore.isDark}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
                <span>Mode clair</span>
              {:else}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
                <span>Mode sombre</span>
              {/if}
            </button>

            <button class="menu-item" onclick={() => (showUserMenu = false)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Parametres</span>
            </button>

            <div class="menu-divider"></div>

            <button
              class="menu-item danger"
              onclick={handleClearAllConversations}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              <span>Effacer les conversations</span>
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</aside>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    width: 280px;
    height: 100%;
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    transition: width 0.3s ease;
  }

  .sidebar.collapsed {
    width: 64px;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    padding: 16px;
    gap: 12px;
  }

  .sidebar.collapsed .sidebar-header {
    flex-direction: column;
    padding: 12px 8px;
    gap: 8px;
  }

  .new-chat-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
  }

  .new-chat-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  }

  .new-chat-btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 12px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .new-chat-btn-icon:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  }

  .search-container {
    position: relative;
    padding: 0 16px 16px;
  }

  .search-icon {
    position: absolute;
    left: 28px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 12px 12px 12px 42px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: white;
    font-size: 14px;
    outline: none;
    transition: all 0.2s ease;
  }

  .search-input::placeholder {
    color: #6b7280;
  }

  .search-input:focus {
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.08);
  }

  .conversations-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }

  .conversations-list::-webkit-scrollbar {
    width: 6px;
  }

  .conversations-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .conversations-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    text-align: center;
    color: #9ca3af;
  }

  .empty-state .hint {
    font-size: 13px;
    color: #6b7280;
    margin-top: 4px;
  }

  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .user-info {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-radius: 10px;
    transition: background 0.2s ease;
    cursor: pointer;
  }

  .user-info:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    color: white;
  }

  .username {
    color: #e5e7eb;
    font-size: 14px;
    font-weight: 500;
    flex: 1;
  }

  .chevron {
    color: #6b7280;
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .user-menu {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    right: 0;
    padding: 8px;
    background: #2a2a40;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
    animation: slideUp 0.2s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .user-menu .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: #e5e7eb;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s ease;
    text-align: left;
  }

  .user-menu .menu-item:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .user-menu .menu-item.danger {
    color: #ef4444;
  }

  .user-menu .menu-item.danger:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  .menu-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 8px 0;
  }
</style>
