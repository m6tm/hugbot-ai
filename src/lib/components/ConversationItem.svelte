<script lang="ts">
/**
 * Composant ConversationItem - Item de conversation dans la sidebar
 */
import type { Conversation } from "$lib/domain/entities/conversation";
import { chatStore } from "$lib/stores";
import ConfirmModal from "./ui/ConfirmModal.svelte";

interface Props {
	conversation: Conversation;
	isActive?: boolean;
}

const { conversation, isActive = false }: Props = $props();

let isEditing = $state(false);
let editTitle = $state("");
let showMenu = $state(false);
let showDeleteConfirm = $state(false);

function handleSelect() {
	if (!isEditing) {
		chatStore.selectConversation(conversation.id);
	}
}

function requestDelete(e: MouseEvent) {
	e.stopPropagation();
	showMenu = false;
	showDeleteConfirm = true;
}

function confirmDelete() {
	chatStore.deleteConversation(conversation.id);
	showDeleteConfirm = false;
}

function cancelDelete() {
	showDeleteConfirm = false;
}

function startEditing(e: MouseEvent) {
	e.stopPropagation();
	editTitle = conversation.title;
	isEditing = true;
	showMenu = false;
}

async function saveEdit() {
	if (editTitle.trim() && editTitle !== conversation.title) {
		await chatStore.renameConversation(conversation.id, editTitle.trim());
	}
	isEditing = false;
}

function handleKeydown(e: KeyboardEvent) {
	if (e.key === "Enter") {
		saveEdit();
	} else if (e.key === "Escape") {
		isEditing = false;
	}
}

function formatDate(date: Date): string {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));

	if (days === 0) return "Aujourd'hui";
	if (days === 1) return "Hier";
	if (days < 7) return `Il y a ${days} jours`;

	return date.toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "short",
	});
}

function toggleMenu(e: MouseEvent) {
	e.stopPropagation();
	showMenu = !showMenu;
}
</script>

<ConfirmModal
  isOpen={showDeleteConfirm}
  title="Supprimer la conversation"
  message="Etes-vous sur de vouloir supprimer cette conversation ? Cette action est irreversible."
  confirmText="Supprimer"
  cancelText="Annuler"
  variant="danger"
  onConfirm={confirmDelete}
  onCancel={cancelDelete}
/>

<div
  class="conversation-item"
  class:active={isActive}
  onclick={handleSelect}
  onkeydown={(e) => e.key === "Enter" && handleSelect()}
  onfocusout={() => setTimeout(() => (showMenu = false), 200)}
  role="button"
  tabindex="0"
>
  <div class="icon">
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  </div>

  <div class="content">
    {#if isEditing}
      <input
        type="text"
        bind:value={editTitle}
        onblur={saveEdit}
        onkeydown={handleKeydown}
        class="edit-input"
      />
    {:else}
      <span class="title">{conversation.title}</span>
      <span class="date">{formatDate(conversation.updatedAt)}</span>
    {/if}
  </div>

  <div class="actions">
    <button class="action-btn" onclick={toggleMenu} aria-label="Options">
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
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    </button>

    {#if showMenu}
      <div class="menu">
        <button class="menu-item" onclick={startEditing}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
          Renommer
        </button>
        <button class="menu-item danger" onclick={requestDelete}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
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
          Supprimer
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .conversation-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px;
    margin-bottom: 4px;
    background: transparent;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    position: relative;
  }

  .conversation-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .conversation-item.active {
    background: rgba(102, 126, 234, 0.15);
    border: 1px solid rgba(102, 126, 234, 0.3);
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    color: #9ca3af;
    flex-shrink: 0;
  }

  .conversation-item.active .icon {
    background: rgba(102, 126, 234, 0.2);
    color: #667eea;
  }

  .content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .title {
    font-size: 14px;
    font-weight: 500;
    color: #e5e7eb;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .date {
    font-size: 12px;
    color: #6b7280;
  }

  .edit-input {
    width: 100%;
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid #667eea;
    border-radius: 6px;
    color: white;
    font-size: 14px;
    outline: none;
  }

  .actions {
    position: relative;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .conversation-item:hover .actions {
    opacity: 1;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: #9ca3af;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .menu {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 50;
    min-width: 140px;
    padding: 6px;
    background: #2a2a40;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: #e5e7eb;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .menu-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .menu-item.danger {
    color: #ef4444;
  }

  .menu-item.danger:hover {
    background: rgba(239, 68, 68, 0.1);
  }
</style>
