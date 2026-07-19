import { supabase } from "./supabase";

const USER_ID_KEY = "mnemo_user_id";

export type DeviceType = "mobile" | "desktop";

// Cihaz tipini user agent üzerinden algılar
function detectDevice(): DeviceType {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ? "mobile"
    : "desktop";
}

// Tarayıcı adını user agent üzerinden algılar
function detectBrowser(): string {
  const userAgent = navigator.userAgent;

  if (userAgent.includes("Edg/")) {
    return "Edge";
  }

  if (userAgent.includes("Chrome/") && !userAgent.includes("Edg/")) {
    return "Chrome";
  }

  if (userAgent.includes("Firefox/")) {
    return "Firefox";
  }

  if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
    return "Safari";
  }

  return "Unknown";
}

// users tablosunda ID varsa döner, yoksa insert eder
async function selectOrInsertUser(userId: string): Promise<string | null> {
  try {
    const { data: existing, error: selectError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (selectError) {
      console.error("Kullanıcı select hatası:", selectError.message);
    }

    if (existing?.id) {
      localStorage.setItem(USER_ID_KEY, userId);
      return userId;
    }

    const { error: insertError } = await supabase.from("users").insert({
      id: userId,
      device: detectDevice(),
      browser: detectBrowser(),
      country: null,
    });

    if (insertError) {
      // Başka bir eşzamanlı insert başarılı olmuş olabilir
      if (insertError.code === "23505") {
        localStorage.setItem(USER_ID_KEY, userId);
        return userId;
      }

      console.error("Kullanıcı insert hatası:", insertError.message);
      return null;
    }

    localStorage.setItem(USER_ID_KEY, userId);
    return userId;
  } catch (error) {
    console.error("selectOrInsertUser beklenmeyen hata:", error);
    return null;
  }
}

// Analytics kullanıcısını başlatır; kayıtlı ID varsa insert yapmaz
export async function initUser(): Promise<string> {
  // 1. localStorage'da kayıtlı ID var mı?
  const savedId = localStorage.getItem('mnemo_user_id');
  
  if (savedId) {
    // 2. Varsa direkt döndür, hiçbir şey insert etme
    return savedId;
  }
  
  // 3. Yoksa anonim giriş yap
  const { data: authData } = await supabase.auth.signInAnonymously();
  const userId = authData?.user?.id ?? crypto.randomUUID();
  
  // 4. users tablosuna insert et (sadece ilk kez)
  await supabase.from('users').insert({
    id: userId,
    device: /Mobi/.test(navigator.userAgent) ? 'mobile' : 'desktop',
    browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
             navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other',
    country: null
  });
  
  // 5. localStorage'a kaydet
  localStorage.setItem('mnemo_user_id', userId);
  return userId;
}

// Bilinen auth kullanıcı id'sini analytics users tablosunda garantiler
export async function ensureAnalyticsUser(
  authUserId: string,
): Promise<string | null> {
  try {
    return await selectOrInsertUser(authUserId);
  } catch (error) {
    console.error("ensureAnalyticsUser beklenmeyen hata:", error);
    return null;
  }
}

// Tur sonucunu round_results tablosuna kaydeder
export async function saveRoundResult(
  userId: string,
  level: number,
  score: number,
  elapsedMs: number,
  correct: number,
  total: number,
): Promise<void> {
  try {
    const { error } = await supabase.from("round_results").insert({
      user_id: userId,
      level,
      score,
      elapsed_ms: elapsedMs,
      correct,
      total,
    });

    if (error) {
      console.error("Tur sonucu kaydı başarısız:", error.message);
    }
  } catch (error) {
    console.error("saveRoundResult beklenmeyen hata:", error);
  }
}

// Bölüm tamamlanmasını level_completions tablosuna kaydeder
export async function saveLevelCompletion(
  userId: string,
  level: number,
  roundsTaken: number,
  avgScore: number,
): Promise<void> {
  try {
    const { error } = await supabase.from("level_completions").insert({
      user_id: userId,
      level,
      rounds_taken: roundsTaken,
      avg_score: avgScore,
    });

    if (error) {
      console.error("Bölüm tamamlama kaydı başarısız:", error.message);
    }
  } catch (error) {
    console.error("saveLevelCompletion beklenmeyen hata:", error);
  }
}
