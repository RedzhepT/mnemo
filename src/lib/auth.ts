import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// Email adresine magic link gönderir
export async function signInWithMagicLink(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

// Anonim oturum başlatır ve kullanıcıyı döner
export async function signInAnonymously(): Promise<User> {
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Anonim giriş başarısız oldu");
  }

  return data.user;
}

// Mevcut oturumu kontrol eder ve kullanıcıyı döner
export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Oturum kontrolü başarısız:", error.message);
    return null;
  }

  return data.session?.user ?? null;
}

// Anonim kullanıcıyı email ile ilişkilendirir (doğrulama linki gönderir)
export async function linkEmailToAnonymous(email: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    email: email.trim(),
  });

  if (error) {
    throw new Error(error.message);
  }
}
