import { useState } from "react";
import {
  getCurrentUser,
  linkEmailToAnonymous,
  signInAnonymously,
  signInWithMagicLink,
} from "../lib/auth";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (userId: string) => void;
}

// İlerleme kaydı için magic link / anonim giriş modalını render eder
export function AuthModal({
  isOpen,
  onClose,
  onAuthenticated,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAnonymousLoading, setIsAnonymousLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleMagicLink = async (): Promise<void> => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail.includes("@")) {
      setErrorMessage("Geçerli bir email adresi girin.");
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    try {
      const currentUser = await getCurrentUser();

      if (currentUser?.is_anonymous) {
        await linkEmailToAnonymous(trimmedEmail);
      } else {
        await signInWithMagicLink(trimmedEmail);
      }

      setLinkSent(true);
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
      const user = await signInAnonymously();
      onAuthenticated(user.id);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Anonim giriş başarısız.";
      setErrorMessage(message);
    } finally {
      setIsAnonymousLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
      <section
        className="flex w-full max-w-md flex-col gap-5 rounded-[6px] border border-mnemo-border bg-mnemo-cell px-6 py-8 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-center text-xl font-semibold text-white sm:text-2xl">
          İlerlemenizi kaydetmek ister misiniz?
        </h2>

        {linkSent ? (
          <p className="text-center text-mnemo-primary-hover">
            Email adresinize link gönderdik!
          </p>
        ) : (
          <>
            <label className="flex flex-col gap-2 text-sm text-mnemo-hud">
              Email
              <input
                type="email"
                value={email}
                autoComplete="email"
                placeholder="ornek@email.com"
                className="rounded-[6px] border border-mnemo-border bg-mnemo-bg px-3 py-2.5 text-white outline-none placeholder:text-mnemo-hud/60 focus:border-mnemo-primary"
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <button
              type="button"
              disabled={isSending}
              className="rounded-[6px] bg-mnemo-primary px-8 py-3 font-medium text-white transition-colors hover:bg-mnemo-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => {
                void handleMagicLink();
              }}
            >
              {isSending ? "Gönderiliyor..." : "Magic Link Gönder"}
            </button>
          </>
        )}

        {errorMessage !== null && (
          <p className="text-center text-sm text-red-400">{errorMessage}</p>
        )}

        <button
          type="button"
          disabled={isAnonymousLoading}
          className="rounded-[6px] border border-mnemo-border bg-mnemo-bg px-8 py-3 font-medium text-mnemo-hud transition-colors hover:bg-mnemo-cell-hover hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => {
            void handleAnonymousContinue();
          }}
        >
          {isAnonymousLoading ? "Devam ediliyor..." : "Hayır, anonim devam et"}
        </button>

        <p className="text-center text-xs text-mnemo-hud">
          Email adresiniz sadece ilerlemenizi kaydetmek için kullanılır.
        </p>

        {linkSent && (
          <button
            type="button"
            className="text-sm text-mnemo-hud underline transition-colors hover:text-white"
            onClick={onClose}
          >
            Kapat
          </button>
        )}
      </section>
    </div>
  );
}
