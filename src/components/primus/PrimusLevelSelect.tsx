import { DEBUG_MODE, PRIMUS_MAX_LEVEL } from "../../utils/constants";
import {
  getAllPrimusLevelConfigs,
  getQuestionModeLabel,
} from "../../utils/primus/levels";

export interface PrimusLevelSelectProps {
  currentLevel: number;
  onSelectLevel: (level: number) => void;
  onClose: () => void;
}

const LEVELS = Array.from({ length: PRIMUS_MAX_LEVEL }, (_, index) => index + 1);

// Primus bölüm seçim tablosunu ve mobil kart listesini render eder
export function PrimusLevelSelect({
  currentLevel,
  onSelectLevel,
  onClose,
}: PrimusLevelSelectProps) {
  const configs = getAllPrimusLevelConfigs();

  // Bölümün seçilebilir olup olmadığını kontrol eder
  const isLevelUnlocked = (levelNumber: number): boolean => {
    if (DEBUG_MODE) {
      return true;
    }

    return levelNumber <= currentLevel;
  };

  return (
    <section className="flex max-h-[calc(100svh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[6px] border border-mnemo-border bg-mnemo-cell">
      <div className="relative shrink-0 border-b border-mnemo-border px-3 py-3 sm:px-6 sm:py-4">
        <button
          type="button"
          aria-label="Kapat"
          title="Kapat"
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#2A2A45] text-base text-[#6B6B8A] transition-colors hover:bg-[#3A3A60] hover:text-[#F0D9B5] active:scale-95 sm:right-4 sm:top-3"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="pr-10 text-center text-lg font-semibold text-[#F0D9B5] sm:text-2xl">
          Primus Bölüm Seç
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-4">
        <ul className="flex flex-col gap-2 md:hidden">
          {LEVELS.map((levelNumber) => {
            const config = configs[levelNumber - 1];
            const isCurrentLevel = levelNumber === currentLevel;
            const unlocked = isLevelUnlocked(levelNumber);

            return (
              <li key={levelNumber}>
                <button
                  type="button"
                  disabled={!unlocked}
                  aria-label={`Bölüm ${levelNumber} seç`}
                  aria-current={isCurrentLevel ? "true" : undefined}
                  className={`w-full rounded-[6px] border p-3 text-left transition-colors active:scale-[0.99] ${
                    !unlocked
                      ? "cursor-not-allowed border-mnemo-border/50 bg-mnemo-bg/20 text-mnemo-hud/40"
                      : isCurrentLevel
                        ? "border-[#B58863]/60 bg-[#B58863]/25 text-[#F0D9B5]"
                        : "border-mnemo-border bg-mnemo-bg/40 text-mnemo-hud hover:bg-[#F0D9B5]/10 hover:text-[#F0D9B5]"
                  }`}
                  onClick={() => {
                    if (unlocked) {
                      onSelectLevel(levelNumber);
                    }
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl font-semibold">
                      Bölüm {levelNumber}
                      {isCurrentLevel ? " ✓" : ""}
                      {!unlocked ? " 🔒" : ""}
                    </span>
                    <span className="text-xs sm:text-sm">
                      {getQuestionModeLabel(config.questionMode)}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs sm:text-sm">
                    <div>
                      <span className="block text-[#F0D9B5]/60">Grid</span>
                      <span>
                        {config.gridSize}×{config.gridSize}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[#F0D9B5]/60">Hedef</span>
                      <span>{config.targetCount}</span>
                    </div>
                    <div>
                      <span className="block text-[#F0D9B5]/60">Süre</span>
                      <span>{config.roundTimeSec} sn</span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="hidden overflow-x-auto rounded-[6px] border border-mnemo-border md:block">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-mnemo-border bg-[#2A2A45] text-[#F0D9B5]">
                <th className="px-3 py-2.5 font-medium">Bölüm</th>
                <th className="px-3 py-2.5 font-medium">Grid</th>
                <th className="px-3 py-2.5 font-medium">N</th>
                <th className="px-3 py-2.5 font-medium">Süre</th>
                <th className="px-3 py-2.5 font-medium">Soru tipi</th>
              </tr>
            </thead>
            <tbody>
              {LEVELS.map((levelNumber) => {
                const config = configs[levelNumber - 1];
                const isCurrentLevel = levelNumber === currentLevel;
                const unlocked = isLevelUnlocked(levelNumber);

                return (
                  <tr
                    key={levelNumber}
                    className="border-b border-mnemo-border/60"
                  >
                    <td colSpan={5} className="p-0">
                      <button
                        type="button"
                        disabled={!unlocked}
                        aria-label={`Bölüm ${levelNumber} seç`}
                        aria-current={isCurrentLevel ? "true" : undefined}
                        className={`grid w-full min-w-[40rem] grid-cols-5 text-left transition-colors ${
                          !unlocked
                            ? "cursor-not-allowed bg-mnemo-bg/20 text-mnemo-hud/40"
                            : isCurrentLevel
                              ? "bg-[#B58863]/25 text-[#F0D9B5]"
                              : "bg-mnemo-bg/40 text-mnemo-hud hover:bg-[#F0D9B5]/10 hover:text-[#F0D9B5]"
                        }`}
                        onClick={() => {
                          if (unlocked) {
                            onSelectLevel(levelNumber);
                          }
                        }}
                      >
                        <span className="px-3 py-2.5 font-medium">
                          {levelNumber}
                          {isCurrentLevel ? " ✓" : ""}
                          {!unlocked ? " 🔒" : ""}
                        </span>
                        <span className="px-3 py-2.5">
                          {config.gridSize}×{config.gridSize}
                        </span>
                        <span className="px-3 py-2.5">{config.targetCount}</span>
                        <span className="px-3 py-2.5">
                          {config.roundTimeSec} sn
                        </span>
                        <span className="px-3 py-2.5">
                          {getQuestionModeLabel(config.questionMode)}
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
