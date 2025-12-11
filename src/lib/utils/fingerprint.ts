/**
 * Utilitaire de fingerprinting pour identifier les utilisateurs de manière unique
 * Combine plusieurs caractéristiques du navigateur pour créer une empreinte
 */

/**
 * Génère une empreinte unique basée sur les caractéristiques du navigateur
 */
export async function generateFingerprint(): Promise<string> {
  const components: string[] = [];

  // User Agent
  components.push(navigator.userAgent);

  // Langues
  components.push(navigator.languages?.join(",") || navigator.language || "");

  // Fuseau horaire
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || "");
  components.push(String(new Date().getTimezoneOffset()));

  // Résolution d'écran
  components.push(`${screen.width}x${screen.height}`);
  components.push(`${screen.colorDepth}`);

  // Plateforme
  components.push(navigator.platform || "");

  // Nombre de coeurs CPU
  components.push(String(navigator.hardwareConcurrency || 0));

  // Mémoire (si disponible)
  const nav = navigator as Navigator & { deviceMemory?: number };
  components.push(String(nav.deviceMemory || 0));

  // Canvas fingerprint
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("Fingerprint", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("Canvas", 4, 17);
      components.push(canvas.toDataURL());
    }
  } catch {
    components.push("canvas-error");
  }

  // WebGL fingerprint
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "");
        components.push(
          gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ""
        );
      }
    }
  } catch {
    components.push("webgl-error");
  }

  // Plugins (liste simplifiée)
  const plugins = Array.from(navigator.plugins || [])
    .map((p) => p.name)
    .sort()
    .join(",");
  components.push(plugins);

  // Touch support
  components.push(String("ontouchstart" in window));
  components.push(String(navigator.maxTouchPoints || 0));

  const fingerprintString = components.join("|");
  const hash = await hashString(fingerprintString);

  return hash;
}

/**
 * Hash une chaîne de caractères avec SHA-256
 */
async function hashString(str: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

/**
 * Récupère ou génère le fingerprint stocké en session
 */
export async function getOrCreateFingerprint(): Promise<string> {
  const storageKey = "hb_fp";

  try {
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      return stored;
    }

    const fingerprint = await generateFingerprint();
    sessionStorage.setItem(storageKey, fingerprint);
    return fingerprint;
  } catch {
    return await generateFingerprint();
  }
}
