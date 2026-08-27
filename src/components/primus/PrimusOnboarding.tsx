import { useState } from "react";

export const PRIMUS_ONBOARDING_SEEN_KEY = "primus_onboarding_seen";

const PRIMUS_ONBOARDING_STEPS = [
  {
    title: "Primus'a Hoş Geldin",
    description:
      "Sayıları tanıma ve hızlı seçim oyunu. Tahtada sayılar baştan durur; hatırlama sırası yoktur.",
  },
  {
    title: "Asal veya Kare/Küp",
    description:
      "Her turda görev değişir: asalları veya kare/küpleri bul. Örnek: 2² = 4, 3³ = 27.",
  },
  {
    title: "Seçim ve Toggle",
    description:
      "Doğru hücreleri işaretle. Yanlış tıklama turu bitirmez ama puanı düşürür. Aynı hücreye tekrar tıklayınca seçimi geri alırsın; Kalan seçim buna göre güncellenir.",
  },
  {
    title: "Süre, Puan, Hazır",
    description:
      "8 saniye veya kalan seçim bitince tur biter. Hızlı ve doğru ol → yüksek puan. Son 10 tur ortalaması %90+ → bölüm tamamlandı. İyi oyunlar!",
  },
] as const;

export interface PrimusOnboardingProps {
  onComplete: () => void;
}

// İlk /primus ziyaretinde gösterilen adım adım tanıtım modalını render eder
export function PrimusOnboarding({ onComplete }: PrimusOnboardingProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = PRIMUS_ONBOARDING_STEPS[stepIndex];
  const isLastStep = stepIndex === PRIMUS_ONBOARDING_STEPS.length - 1;

  // Sonraki adıma geçer veya onboarding'i tamamlar
  const handleNext = (): void => {
    if (isLastStep) {
      localStorage.setItem(PRIMUS_ONBOARDING_SEEN_KEY, "true");
      onComplete();
      return;
    }

    setStepIndex((previous) => previous + 1);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
      <section className="flex w-full max-w-md flex-col items-center gap-6 rounded-[6px] border border-mnemo-border bg-mnemo-cell px-6 py-8 text-center shadow-lg">
        <h2 className="text-2xl font-semibold text-white">{currentStep.title}</h2>
        <p className="text-sm text-mnemo-hud sm:text-base">{currentStep.description}</p>

        <div className="flex items-center gap-2">
          {PRIMUS_ONBOARDING_STEPS.map((_, index) => (
            <span
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === stepIndex ? "bg-mnemo-primary-hover" : "bg-mnemo-border"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        <button
          type="button"
          className="rounded-[6px] bg-mnemo-primary px-8 py-3 font-medium text-white transition-colors hover:bg-mnemo-primary-hover active:scale-95"
          onClick={handleNext}
        >
          {isLastStep ? "Başla" : "İleri"}
        </button>
      </section>
    </div>
  );
}
