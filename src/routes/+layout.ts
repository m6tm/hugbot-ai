import {
  createBrowserClient,
  isBrowser,
  parseCookieHeader,
} from "@supabase/ssr";
import {
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_URL,
} from "$env/static/public";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends("supabase:auth");

  const supabase = createBrowserClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        fetch,
      },
      cookies: {
        getAll() {
          if (!isBrowser()) {
            return data.cookies;
          }
          const cookies = parseCookieHeader(document.cookie);
          return Object.keys(cookies).map((key) => ({
            name: key,
            value: (cookies as never as Record<string, string>)[key],
          }));
        },
        setAll(cookiesToSet) {
          if (!isBrowser()) return;

          cookiesToSet.forEach(({ name, value, options }) => {
            let str = `${name}=${value}`;
            if (options.maxAge) str += `; Max-Age=${options.maxAge}`;
            if (options.domain) str += `; Domain=${options.domain}`;
            if (options.path) str += `; Path=${options.path}`;
            if (options.expires)
              str += `; Expires=${new Date(options.expires).toUTCString()}`;
            if (options.httpOnly) str += "; HttpOnly";
            if (options.secure) str += "; Secure";
            if (options.sameSite) str += `; SameSite=${options.sameSite}`;

            // biome-ignore lint/suspicious/noDocumentCookie: Standard Supabase SSR cookie handling
            document.cookie = str;
          });
        },
      },
    }
  );

  /**
   * It's fine to use `getSession` here, because on the client, `getSession` is
   * safe, and on the server, it reads `session` from the `LayoutServerLoad` data.
   */
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return { supabase, session: session ?? data.session };
};
