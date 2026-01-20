<script lang="ts">
/**
 * Skeleton loader for message bubbles
 */
interface Props {
	align?: "left" | "right";
}

const { align = "left" }: Props = $props();
</script>

<div class="skeleton-bubble {align}">
  <div class="skeleton-avatar"></div>
  <div class="skeleton-content">
    <div class="skeleton-header"></div>
    <div class="skeleton-text">
      <div class="skeleton-line full"></div>
      <div class="skeleton-line medium"></div>
      <div class="skeleton-line short"></div>
    </div>
  </div>
</div>

<style>
  .skeleton-bubble {
    display: flex;
    gap: 16px;
    width: 100%;
    animation: fadeIn 0.3s ease;
  }

  .skeleton-bubble.right {
    flex-direction: row-reverse;
  }

  .skeleton-avatar {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--bg-input);
    animation: pulse 1.5s infinite ease-in-out;
    flex-shrink: 0;
  }

  .skeleton-content {
    flex: 1;
    max-width: 75%;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .right .skeleton-content {
    align-items: flex-end;
  }

  .skeleton-header {
    height: 12px;
    width: 100px;
    border-radius: 4px;
    background: var(--bg-input);
    animation: pulse 1.5s infinite ease-in-out;
    margin-bottom: 4px;
  }

  .skeleton-text {
    padding: 16px 20px;
    border-radius: 16px;
    background: var(--bg-input);
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .right .skeleton-text {
    border-bottom-right-radius: 4px;
  }

  .left .skeleton-text {
    border-bottom-left-radius: 4px;
  }

  .skeleton-line {
    height: 10px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    animation: pulse 1.5s infinite ease-in-out;
  }

  .skeleton-line.full {
    width: 90%;
  }

  .skeleton-line.medium {
    width: 70%;
    animation-delay: 0.1s;
  }

  .skeleton-line.short {
    width: 40%;
    animation-delay: 0.2s;
  }

  @media (max-width: 767px) {
    .skeleton-bubble {
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-bubble.right {
      flex-direction: column;
      align-items: flex-end;
    }

    .skeleton-bubble.right .skeleton-avatar {
      order: 0;
    }

    .skeleton-avatar {
      width: 32px;
      height: 32px;
    }

    .skeleton-content {
      max-width: 100%;
      width: 100%;
    }

    .right .skeleton-content {
      align-items: flex-end;
    }
  }

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

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
