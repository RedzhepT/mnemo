import { useState } from "react";
import { getCurrentUser, signInAnonymously, signInWithMagicLink } from "../lib/auth";

export const AUTH_SHOWN_KEY = "mnemo_auth_shown";

export interface LandingProps {
  onEnterGame: () => void;
  onAuthenticated: (userId: string) => void;
}

const STEPS = [
  {
    emoji: "🧠",
    title: "İzle",
    description: "Kareler sırayla yanar, hangisi hangi sırada?",
  },
  {
    emoji: "☝️",
    title: "Hatırla",
    description: "Aynı sırayla işaretle",
  },
  {
    emoji: "⚡",
    title: "Geliş",
    description: "Her bölümde zorluk artar",
  },
] as const;

// İlk ziyaret landing sayfasını render eder
export function Landing({ onEnterGame, onAuthenticated }: LandingProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAnonymousLoading, setIsAnonymousLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const finishAndEnter = (userId?: string): void => {
    localStorage.setItem(AUTH_SHOWN_KEY, "true");

    if (userId) {
      onAuthenticated(userId);
    }

    onEnterGame();
  };

  const handleStart = async (): Promise<void> => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail.includes("@")) {
      setErrorMessage("Geçerli bir email adresi girin.");
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    try {
      await signInWithMagicLink(trimmedEmail);
      setLinkSent(true);
      localStorage.setItem(AUTH_SHOWN_KEY, "true");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Magic link gönderilemedi.";
      setErrorMessage(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleAnonymousContinue = async (): Promise<void> => {
    setIsAnonymousLoading(true);
    setErrorMessage(null);

    try {
      const existingUser = await getCurrentUser();

      if (existingUser) {
        finishAndEnter(existingUser.id);
        return;
      }

      const user = await signInAnonymously();
      finishAndEnter(user.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Anonim giriş başarısız.";
      setErrorMessage(message);
    } finally {
      setIsAnonymousLoading(false);
    }
  };

  return (
    <div className="flex h-svh flex-col items-center justify-center overflow-y-auto bg-mnemo-bg px-4 py-10">
      <div className="flex w-full max-w-3xl flex-col items-center gap-10 sm:gap-12">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Mnemo
          </h1>
          <p className="text-base text-mnemo-hud sm:text-lg">
            Hafıza ve odaklanma becerisini test et.
          </p>
        </header>

        <section className="grid w-full gap-3 sm:grid-cols-3 sm:gap-4">
          {STEPS.map((step) => (
            <article
              key={step.title}
              className="flex flex-col items-center gap-2 rounded-[6px] border border-mnemo-border bg-mnemo-cell px-4 py-5 text-center"
            >
              <span className="text-2xl" aria-hidden="true">
                {step.emoji}
              </span>
              <h2 className="text-lg font-semibold text-white">{step.title}</h2>
              <p className="text-sm text-mnemo-hud">{step.description}</p>
            </article>
          ))}
        </section>

        <section className="flex w-full max-w-md flex-col items-center gap-4 rounded-[6px] border border-mnemo-border bg-mnemo-cell px-5 py-6 sm:px-6">
          <p className="text-center text-sm text-mnemo-hud sm:text-base">
            İlerlemenizi kaydetmek için email girin
          </p>

          {linkSent ? (
            <>
              <p className="text-center text-mnemo-primary-hover">
                Email adresinize link gönderdik!
              </p>
              <button
                type="button"
                className="rounded-[6px] bg-mnemo-primary px-8 py-3 font-medium text-white transition-colors hover:bg-mnemo-primary-hover active:scale-95"
                onClick={() => onEnterGame()}
              >
                Oyuna Geç
              </button>
            </>
          ) : (
            <>
              <label className="flex w-full flex-col gap-2 text-sm text-mnemo-hud">
                Email
                <input
                  type="email"
                  value={email}
                  autoComplete="email"
                  placeholder="ornek@email.com"
                  className="rounded-[6px] border border-mnemo-border bg-mnemo-bg px-3 py-2.5 text-white outline-none placeholder:text-mnemo-hud/60 focus:border-mnemo-primary"
                  onChange={(event) => setEmail(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void handleStart();
                    }
                  }}
                />
              </label>

              <button
                type="button"
                disabled={isSending}
                className="w-full rounded-[6px] bg-mnemo-primary px-8 py-3 font-medium text-white transition-colors hover:bg-mnemo-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => {
                  void handleStart();
                }}
              >
                {isSending ? "Gönderiliyor..." : "Başla"}
              </button>
            </>
          )}

          {errorMessage !== null && (
            <p className="text-center text-sm text-red-400">{errorMessage}</p>
          )}

          {!linkSent && (
            <button
              type="button"
              disabled={isAnonymousLoading}
              className="text-sm text-mnemo-hud underline transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => {
                void handleAnonymousContinue();
              }}
            >
              {isAnonymousLoading
                ? "Devam ediliyor..."
                : "Kayıt olmadan devam et"}
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
