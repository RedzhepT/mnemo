import type { PrimusRoundType } from "../../utils/primus/numbers";
import {
  getBriefingExample,
  getRoundTaskLabel,
} from "../../utils/primus/numbers";

export interface PrimusBriefingProps {
  roundType: PrimusRoundType;
  onSkip: () => void;
}

// Tur başlamadan önce görev önizlemesi tam ekran katmanını render eder
export function PrimusBriefing({ roundType, onSkip }: PrimusBriefingProps) {
  const taskLabel = getRoundTaskLabel(roundType);
  const exampleLabel = getBriefingExample(roundType);

  return (
    <button
      type="button"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      aria-label="Görev önizlemesi — devam etmek için tıkla"
      onClick={onSkip}
    >
      <section className="flex w-full max-w-md flex-col items-center gap-4 rounded-[6px] border border-mnemo-border bg-mnemo-cell px-6 py-8 text-center shadow-lg">
        <h2 className="text-2xl font-semibold text-white">{taskLabel}</h2>
        <p className="text-lg text-mnemo-primary-hover">{exampleLabel}</p>
        <p className="text-sm text-mnemo-hud">
          Tıkla veya Space ile devam
        </p>
      </section>
    </button>
  );
}
