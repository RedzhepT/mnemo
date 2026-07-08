import { MAX_LEVEL } from "../utils/constants";
import { getLevelConfig } from "../utils/levels";

export interface LevelSelectProps {
  currentLevel: number;
  onSelectLevel: (level: number) => void;
}

const SHOW_SPEED_LABELS: Record<number, string> = {
  600: "Yavaş",
  500: "Orta",
  400: "Hızlı",
};

// Gösterim süresini okunabilir etikete çevirir
function getShowSpeedLabel(showTimeMs: number): string {
  return SHOW_SPEED_LABELS[showTimeMs] ?? `${showTimeMs}ms`;
}

// Oyun modunu tablo için etiket olarak döner
function getModeLabel(mode: "normal" | "emoji"): string {
  return mode === "normal" ? "Normal" : "🐱🐻 Emoji";
}

const LEVELS = Array.from({ length: MAX_LEVEL }, (_, index) => index + 1);

// Bölüm tamamlandığında sonraki bölüm seçim tablosunu render eder
export function LevelSelect({ currentLevel, onSelectLevel }: LevelSelectProps) {
  return (
    <section className="flex w-full max-w-2xl flex-col gap-5 rounded-[6px] border border-mnemo-border bg-mnemo-cell px-4 py-6 sm:px-6 sm:py-8">
      <h2 className="text-center text-xl font-semibold text-[#F0D9B5] sm:text-2xl">
        Sonraki Bölümü Seç
      </h2>

      <div className="overflow-x-auto rounded-[6px] border border-mnemo-border">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-mnemo-border bg-[#2A2A45] text-[#F0D9B5]">
              <th className="px-3 py-2.5 font-medium">Bölüm No</th>
              <th className="px-3 py-2.5 font-medium">Grid Boyutu</th>
              <th className="px-3 py-2.5 font-medium">Kare Sayısı</th>
              <th className="px-3 py-2.5 font-medium">Gösterim Hızı</th>
              <th className="px-3 py-2.5 font-medium">Mod</th>
            </tr>
          </thead>
          <tbody>
            {LEVELS.map((levelNumber) => {
              const config = getLevelConfig(levelNumber);
              const isCurrentLevel = levelNumber === currentLevel;

              return (
                <tr key={levelNumber} className="border-b border-mnemo-border/60">
                  <td colSpan={5} className="p-0">
                    <button
                      type="button"
                      aria-label={`Bölüm ${levelNumber} seç`}
                      aria-current={isCurrentLevel ? "true" : undefined}
                      className={`grid w-full min-w-[36rem] grid-cols-5 text-left transition-colors ${
                        isCurrentLevel
                          ? "bg-[#B58863]/25 text-[#F0D9B5]"
                          : "bg-mnemo-bg/40 text-mnemo-hud hover:bg-[#F0D9B5]/10 hover:text-[#F0D9B5]"
                      }`}
                      onClick={() => onSelectLevel(levelNumber)}
                    >
                      <span className="px-3 py-2.5 font-medium">
                        {levelNumber}
                        {isCurrentLevel ? " ✓" : ""}
                      </span>
                      <span className="px-3 py-2.5">
                        {config.gridSize}×{config.gridSize}
                      </span>
                      <span className="px-3 py-2.5">{config.sequenceLength}</span>
                      <span className="px-3 py-2.5">
                        {getShowSpeedLabel(config.showTimeMs)}
                      </span>
                      <span className="px-3 py-2.5">
                        {getModeLabel(config.mode)}
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
