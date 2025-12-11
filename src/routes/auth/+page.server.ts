import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession();
  if (session) {
    redirect(303, "/");
  }
};

export const actions: Actions = {
  login: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return fail(400, { email, missing: true });
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return fail(400, { email, error: error.message });
    }

    redirect(303, "/");
  },

  register: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!email || !password || !confirmPassword) {
      return fail(400, { email, missing: true });
    }

    if (password !== confirmPassword) {
      return fail(400, { email, passwordMismatch: true });
    }

    // On cree l'utilisateur
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Utiliser des donnees supplementaires si besoin
        data: {
          // full_name: ...
        },
      },
    });

    if (error) {
      return fail(400, { email, error: error.message });
    }

    // Si une session est retournee (ex: confirmation email desactivee), on connecte direct
    if (data.session) {
      redirect(303, "/");
    }

    // En mode dev, on connecte directement ou on demande confirmation selon la config supabase
    // Ici, on verra si l'utilisateur est connecte directement (si email confirmation off)
    // Sinon on retourne un succes

    return { success: true };
  },

  logout: async ({ locals: { supabase } }) => {
    await supabase.auth.signOut();
    redirect(303, "/");
  },
};
