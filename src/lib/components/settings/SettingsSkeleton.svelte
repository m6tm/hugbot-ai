<script lang="ts">
/**
 * Skeleton loader for Settings Page
 */
import { ArrowLeft } from "lucide-svelte";
</script>

<div class="settings-container">
  <header class="settings-header">
    <div class="back-btn-skeleton">
      <div class="skeleton-icon-small"></div>
      <div class="skeleton-text-small" style="width: 60px;"></div>
    </div>
    <div class="skeleton-title"></div>
    <div class="skeleton-subtitle"></div>
  </header>

  <div class="settings-grid">
    {#each Array(4) as _}
      <div class="settings-card-skeleton">
        <div class="card-header-skeleton">
          <div class="skeleton-icon-medium"></div>
          <div class="skeleton-text-medium" style="width: 150px;"></div>
        </div>
        <div class="card-content-skeleton">
          <div class="skeleton-row">
            <div class="skeleton-label"></div>
            <div class="skeleton-input"></div>
          </div>
          <div class="skeleton-row">
            <div class="skeleton-label"></div>
            <div class="skeleton-input"></div>
          </div>
          <div class="skeleton-footer">
            <div class="skeleton-button"></div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  /* Reuse layout variables if possible, otherwise mock */
  .settings-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    height: 100vh;
    overflow-y: auto;
  }

  .settings-header {
    margin-bottom: 2.5rem;
  }

  /* Skeleton Animations */
  @keyframes pulse {
    0% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.2;
    }
    100% {
      opacity: 0.5;
    }
  }

  .skeleton-title {
    height: 32px;
    width: 200px;
    background: var(--bg-input, #333);
    border-radius: 8px;
    margin-bottom: 10px;
    animation: pulse 1.5s infinite ease-in-out;
  }

  .skeleton-subtitle {
    height: 16px;
    width: 300px;
    background: var(--bg-input, #333);
    border-radius: 4px;
    animation: pulse 1.5s infinite ease-in-out;
    animation-delay: 0.1s;
  }

  .back-btn-skeleton {
    display: flex;
    gap: 10px;
    margin-bottom: 1rem;
    align-items: center;
  }

  .skeleton-icon-small {
    width: 20px;
    height: 20px;
    background: var(--bg-input, #333);
    border-radius: 4px;
    animation: pulse 1.5s infinite ease-in-out;
  }
  .skeleton-text-small {
    height: 14px;
    background: var(--bg-input, #333);
    border-radius: 4px;
    animation: pulse 1.5s infinite ease-in-out;
  }

  .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
    gap: 1.5rem;
    padding-bottom: 2rem;
  }

  .settings-card-skeleton {
    background: var(--bg-secondary, #1e1e1e);
    border: 1px solid var(--border-color, #333);
    border-radius: 12px;
    overflow: hidden;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .card-header-skeleton {
    padding: 1.25rem;
    border-bottom: 1px solid var(--border-color, #333);
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.02);
  }

  .skeleton-icon-medium {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: var(--bg-input, #333);
    animation: pulse 1.5s infinite ease-in-out;
  }
  .skeleton-text-medium {
    height: 20px;
    background: var(--bg-input, #333);
    border-radius: 6px;
    animation: pulse 1.5s infinite ease-in-out;
  }

  .card-content-skeleton {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .skeleton-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .skeleton-label {
    height: 16px;
    width: 120px;
    background: var(--bg-input, #333);
    border-radius: 4px;
    animation: pulse 1.5s infinite ease-in-out;
  }

  .skeleton-input {
    height: 40px;
    width: 100%;
    background: var(--bg-input, #333);
    border-radius: 8px;
    animation: pulse 1.5s infinite ease-in-out;
    animation-delay: 0.1s;
  }

  .skeleton-footer {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
    padding-top: 1rem;
  }

  .skeleton-button {
    height: 36px;
    width: 100px;
    background: var(--bg-input, #333);
    border-radius: 8px;
    animation: pulse 1.5s infinite ease-in-out;
  }
</style>
