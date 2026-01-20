<script lang="ts">
import { fade } from "svelte/transition";
</script>

<div
  class="loader-overlay"
  in:fade={{ duration: 200 }}
  out:fade={{ duration: 200 }}
>
  <div class="loader-content">
    <div class="scanner">
      <div class="scanner-line"></div>
      <div class="scanner-core"></div>
    </div>
    <div class="loading-text">
      <span class="text-char">C</span>
      <span class="text-char">h</span>
      <span class="text-char">a</span>
      <span class="text-char">r</span>
      <span class="text-char">g</span>
      <span class="text-char">e</span>
      <span class="text-char">m</span>
      <span class="text-char">e</span>
      <span class="text-char">n</span>
      <span class="text-char">t</span>
    </div>
  </div>
</div>

<style>
  .loader-overlay {
    position: fixed; /* Or absolute relative to container, but fixed covers viewport usually which might be better for full page load */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-main, #0f172a); /* Fallback to dark */
    z-index: 50;
    /* Glassmorphism subtle */
    backdrop-filter: blur(5px);
  }

  /* If used inside a container that is relative, modify accordingly. 
     For settings page, it's replacing content so filling the container is good. */
  .loader-overlay {
    position: absolute;
    background: transparent; /* Let the page background show through or set specific */
  }

  /* Resetting to fit the specific use case: replace the skeleton in the flow */
  .loader-overlay {
    position: relative;
    height: 60vh; /* Takes up space */
    width: 100%;
    background: transparent;
  }

  .loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  /* Scanner Effect */
  .scanner {
    width: 80px;
    height: 80px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .scanner-core {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #818cf8;
    box-shadow:
      0 0 20px #818cf8,
      0 0 40px #4f46e5;
    animation: pulse-core 2s ease-in-out infinite;
    z-index: 2;
  }

  .scanner-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 2px solid transparent;
    border-top-color: #a5b4fc;
    border-bottom-color: #a5b4fc;
    border-radius: 50%;
    animation: spin 3s linear infinite;
  }

  .scanner-line::before {
    content: "";
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border: 2px solid transparent;
    border-left-color: #6366f1;
    border-right-color: #6366f1;
    border-radius: 50%;
    animation: spin-reverse 2s linear infinite;
  }

  .loading-text {
    font-family: monospace;
    font-size: 1.1rem;
    color: var(--text-main, #e2e8f0);
    letter-spacing: 2px;
    text-transform: uppercase;
    display: flex;
    gap: 2px;
  }

  .text-char {
    opacity: 0;
    animation: fade-in-char 2s infinite;
  }

  .text-char:nth-child(1) {
    animation-delay: 0.1s;
  }
  .text-char:nth-child(2) {
    animation-delay: 0.2s;
  }
  .text-char:nth-child(3) {
    animation-delay: 0.3s;
  }
  .text-char:nth-child(4) {
    animation-delay: 0.4s;
  }
  .text-char:nth-child(5) {
    animation-delay: 0.5s;
  }
  .text-char:nth-child(6) {
    animation-delay: 0.6s;
  }
  .text-char:nth-child(7) {
    animation-delay: 0.7s;
  }
  .text-char:nth-child(8) {
    animation-delay: 0.8s;
  }
  .text-char:nth-child(9) {
    animation-delay: 0.9s;
  }
  .text-char:nth-child(10) {
    animation-delay: 1s;
  }

  @keyframes pulse-core {
    0%,
    100% {
      transform: scale(0.8);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.1);
      opacity: 1;
      box-shadow:
        0 0 30px #818cf8,
        0 0 60px #4f46e5;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes spin-reverse {
    0% {
      transform: rotate(360deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @keyframes fade-in-char {
    0%,
    100% {
      opacity: 0.3;
      transform: translateY(0);
    }
    50% {
      opacity: 1;
      transform: translateY(-3px);
      text-shadow: 0 0 8px #818cf8;
    }
  }
</style>
