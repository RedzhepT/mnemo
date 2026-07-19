import { useState } from "react";
import { linkEmailToAnonymous } from "../lib/auth";

export interface SaveAccountProps {
  isOpen: boolean;
  onClose: () => void;
}

// Anonim kullanıcının email ile hesabını kaydetmesi için modal
export function SaveAccount({ isOpen, onClose }: SaveAccountProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleSendMagicLink = async (): Promise<void> => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail.includes("@")) {
      setErrorMessage("Geçerli bir email adresi girin.");
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    try {
      await linkEmailToAnonymous(trimmedEmail);
      setLinkSent(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Magic link gönderilemedi.";
      setErrorMessage(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = (): void => {
    setEmail("");
    setLinkSent(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
      <section
        className="flex w-full max-w-md flex-col gap-5 rounded-[6px] border border-mnemo-border bg-mnemo-cell px-6 py-8 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-center text-xl font-semibold text-white sm:text-2xl">
          İlerlemenizi kaydetmek için email girin
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
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void handleSendMagicLink();
                  }
                }}
              />
            </label>

            <button
              type="button"
              disabled={isSending}
              className="rounded-[6px] bg-mnemo-primary px-8 py-3 font-medium text-white transition-colors hover:bg-mnemo-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => {
                void handleSendMagicLink();
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
          className="rounded-[6px] border border-mnemo-border bg-mnemo-bg px-8 py-3 font-medium text-mnemo-hud transition-colors hover:bg-mnemo-cell-hover hover:text-white active:scale-95"
          onClick={handleClose}
        >
          Kapat
        </button>
      </section>
    </div>
  );
}
