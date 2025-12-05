<script lang="ts">
  /**
   * Composant ModelSelector - Selecteur de modele AI
   */
  import { settingsStore } from "$lib/stores";
  import { availableModels, type AIModel } from "$lib/config/models";
  import { goto } from "$app/navigation";

  let isOpen = $state(false);

  const currentModel = $derived(
    availableModels.find((m) => m.id === $settingsStore.currentModelId) ||
      availableModels[0]
  );

  function selectModel(model: AIModel) {
    settingsStore.setModel(model.id);
    isOpen = false;
  }

  function toggleDropdown() {
    isOpen = !isOpen;
  }
</script>

<div class="model-selector">
  <button
    class="selector-btn"
    onclick={toggleDropdown}
    onfocusout={() =>
      setTimeout(() => {
        isOpen = false;
      }, 200)}
  >
    <div class="model-info">
      <span class="model-name">{currentModel.name}</span>
      <span class="model-desc">{currentModel.description}</span>
    </div>
    <svg
      class="chevron"
      class:open={isOpen}
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
  </button>

  {#if isOpen}
    <div class="dropdown">
      <div class="models-list">
        {#each availableModels as model (model.id)}
          <button
            class="model-option"
            class:active={model.id === currentModel.id}
            onclick={() => selectModel(model)}
          >
            <div class="option-content">
              <div class="option-header">
                <span class="option-name">{model.name}</span>
              </div>
              <span class="option-desc">{model.description}</span>
            </div>
            {#if model.id === currentModel.id}
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
                class="check-icon"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            {/if}
          </button>
        {/each}
      </div>

      <div class="dropdown-footer">
        <button
          class="change-key-btn"
          onclick={() => {
            isOpen = false;
            goto("/settings");
          }}
        >
          Gerer la cle API
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .model-selector {
    position: relative;
    width: 100%;
    max-width: 350px;
  }

  .selector-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .selector-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .model-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .model-name {
    font-size: 14px;
    font-weight: 500;
    color: #e5e7eb;
  }

  .model-desc {
    font-size: 12px;
    color: #6b7280;
  }

  .chevron {
    color: #6b7280;
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background: #2a2a40;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
    z-index: 100;
    animation: slideDown 0.2s ease;
    overflow: hidden;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .models-list {
    padding: 8px;
    max-height: 300px;
    overflow-y: auto;
  }

  .model-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s ease;
    text-align: left;
  }

  .model-option:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .model-option.active {
    background: rgba(102, 126, 234, 0.15);
  }

  .option-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .option-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .option-name {
    font-size: 14px;
    font-weight: 500;
    color: #e5e7eb;
  }

  .option-desc {
    font-size: 12px;
    color: #6b7280;
  }

  .check-icon {
    color: #667eea;
    flex-shrink: 0;
  }

  .dropdown-footer {
    padding: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .change-key-btn {
    width: 100%;
    padding: 10px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: #6b7280;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .change-key-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #e5e7eb;
  }
</style>
