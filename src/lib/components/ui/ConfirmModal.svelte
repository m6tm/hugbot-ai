<script lang="ts">
  /**
   * Composant ConfirmModal - Boite de dialogue de confirmation
   */

  interface Props {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm: () => void;
    onCancel: () => void;
  }

  let {
    isOpen,
    title,
    message,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    variant = "danger",
    onConfirm,
    onCancel,
  }: Props = $props();

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      onCancel();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div
    class="modal-backdrop"
    onclick={handleBackdropClick}
    onkeydown={(e) =>
      e.key === "Enter" && handleBackdropClick(e as unknown as MouseEvent)}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
  >
    <div class="modal-container">
      <div class="modal-icon {variant}">
        {#if variant === "danger"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
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
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
          </svg>
        {:else if variant === "warning"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
            />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        {/if}
      </div>

      <h2 id="modal-title" class="modal-title">{title}</h2>
      <p class="modal-message">{message}</p>

      <div class="modal-actions">
        <button class="btn btn-cancel" onclick={onCancel}>
          {cancelText}
        </button>
        <button class="btn btn-confirm {variant}" onclick={onConfirm}>
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 400px;
    margin: 16px;
    padding: 32px;
    background: linear-gradient(180deg, #1f1f35 0%, #1a1a2e 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    margin-bottom: 20px;
  }

  .modal-icon.danger {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }

  .modal-icon.warning {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
  }

  .modal-icon.info {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
  }

  .modal-title {
    font-size: 20px;
    font-weight: 600;
    color: white;
    margin: 0 0 8px;
    text-align: center;
  }

  .modal-message {
    font-size: 14px;
    color: #9ca3af;
    text-align: center;
    margin: 0 0 28px;
    line-height: 1.5;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    width: 100%;
  }

  .btn {
    flex: 1;
    padding: 14px 20px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-cancel {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #e5e7eb;
  }

  .btn-cancel:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .btn-confirm {
    color: white;
  }

  .btn-confirm.danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }

  .btn-confirm.danger:hover {
    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
    transform: translateY(-2px);
  }

  .btn-confirm.warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }

  .btn-confirm.warning:hover {
    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
    transform: translateY(-2px);
  }

  .btn-confirm.info {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }

  .btn-confirm.info:hover {
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
    transform: translateY(-2px);
  }
</style>
