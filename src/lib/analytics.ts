import { supabase } from "./supabase";

const USER_ID_KEY = "mnemo_user_id";
const SESSION_ID_KEY = "mnemo_session_id";

export async function initUser(): Promise<string> {
  const savedId = localStorage.getItem('mnemo_user_id');
  if (savedId) {
    console.log('Mevcut ID kullanılıyor:', savedId);
    return savedId;
  }
  
  console.log('Yeni kullanıcı oluşturuluyor');
  const { data } = await supabase.auth.signInAnonymously();
  const userId = data?.user?.id ?? crypto.randomUUID();
  
  const { error } = await supabase.from('users').insert({
    id: userId,
    device: /Mobi/.test(navigator.userAgent) ? 'mobile' : 'desktop',
    browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other',
    country: null
  });
  
  if (error) {
    console.error('Insert hatası:', error.code, error.message);
  }
  
  localStorage.setItem('mnemo_user_id', userId);
  return userId;
}

// Auth kullanıcı id'sini localStorage'a yazar (users insert yapmaz)
export async function ensureAnalyticsUser(
  authUserId: string,
): Promise<string | null> {
  localStorage.setItem(USER_ID_KEY, authUserId);
  return authUserId;
}

// Yeni analytics oturumu başlatır ve session id'yi localStorage'a yazar
export async function startSession(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        user_id: userId,
        started_at: new Date().toISOString(),
        ended_at: null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Oturum başlatma hatası:", error.message);
      return null;
    }

    localStorage.setItem(SESSION_ID_KEY, data.id);
    return data.id;
  } catch (error) {
    console.error("startSession beklenmeyen hata:", error);
    return null;
  }
}

// Açık analytics oturumunu kapatır ve localStorage'dan siler
export async function endSession(): Promise<void> {
  const sessionId = localStorage.getItem(SESSION_ID_KEY);

  if (!sessionId) {
    return;
  }

  try {
    const { error } = await supabase
      .from("sessions")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", sessionId);

    if (error) {
      console.error("Oturum kapatma hatası:", error.message);
    }
  } catch (error) {
    console.error("endSession beklenmeyen hata:", error);
  } finally {
    localStorage.removeItem(SESSION_ID_KEY);
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
