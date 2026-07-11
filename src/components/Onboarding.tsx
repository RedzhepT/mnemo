import { useState } from "react";

export const ONBOARDING_SEEN_KEY = "mnemo_onboarding_seen";

const ONBOARDING_STEPS = [
  {
    title: "Mnemo'ya Hoş Geldin! 🧠",
    description: "Hafıza ve odaklanma becerini test eden bir oyun.",
  },
  {
    title: "Kareleri İzle 👀",
    description:
      "Kareler sırayla yanıp söner. Hangi kare, hangi sırada yandı? Bunu aklında tut.",
  },
  {
    title: "Sırayla İşaretle ☝️",
    description:
      "Kareler söndükten sonra aynı sırayla tıkla. Emoji modunda önce hangi hayvan soruluyorsa onları işaretle.",
  },
  {
    title: "Hazır mısın? 🚀",
    description:
      "Her doğru hamle ve hız seni öne taşır. Space tuşuyla sonraki tura geç. İyi oyunlar!",
  },
] as const;

export interface OnboardingProps {
  onComplete: () => void;
}

// İlk ziyarette gösterilen adım adım tanıtım modalını render eder
export function Onboarding({ onComplete }: OnboardingProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = ONBOARDING_STEPS[stepIndex];
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;

  const handleNext = (): void => {
    if (isLastStep) {
      localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
      onComplete();
      return;
    }

    setStepIndex((previous) => previous + 1);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
      <section className="flex w-full max-w-md flex-col items-center gap-6 rounded-[6px] border border-mnemo-border bg-mnemo-cell px-6 py-8 text-center shadow-lg">
        <h2 className="text-2xl font-semibold text-white">{currentStep.title}</h2>
        <p className="text-mnemo-hud">{currentStep.description}</p>

        <div className="flex items-center gap-2">
          {ONBOARDING_STEPS.map((_, index) => (
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
