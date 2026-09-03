import { useState } from "react";
import { Link } from "react-router-dom";
import { PrimusBriefing } from "../components/primus/PrimusBriefing";
import { PrimusGrid } from "../components/primus/PrimusGrid";
import {
  PrimusHelpButton,
  PrimusHelpModal,
} from "../components/primus/PrimusHelpModal";
import { PrimusLevelSelect } from "../components/primus/PrimusLevelSelect";
import {
  PrimusOnboarding,
  PRIMUS_ONBOARDING_SEEN_KEY,
} from "../components/primus/PrimusOnboarding";
import { usePrimus } from "../hooks/usePrimus";
import {
  DEBUG_MODE,
  MIN_ROUNDS_TO_COMPLETE,
  PRIMUS_MAX_LEVEL,
} from "../utils/constants";
import { getQuestionModeLabel } from "../utils/primus/levels";
import {
  buildResultErrors,
  formatTargetsLabel,
  getRoundTaskLabel,
} from "../utils/primus/numbers";

const buttonClassName =
  "rounded-[6px] bg-mnemo-primary px-8 py-3 font-medium text-white transition-colors hover:bg-mnemo-primary-hover active:scale-95";

const secondaryButtonClassName =
  "rounded-[6px] border border-mnemo-border bg-mnemo-cell px-8 py-3 font-medium text-mnemo-hud transition-colors hover:bg-mnemo-cell-hover hover:text-white active:scale-95";

// Tur geçmişinin ortalama puanını hesaplar
function calculateRoundAverage(roundHistory: number[]): number {
  if (roundHistory.length === 0) {
    return 0;
  }

  return (
    roundHistory.reduce((sum, value) => sum + value, 0) / roundHistory.length
  );
}

// Kalan süreyi saniye cinsinden formatlar
function formatRemainingSeconds(remainingMs: number): string {
  return (remainingMs / 1000).toFixed(1);
}

// localStorage'da Primus onboarding görülüp görülmediğini okur
function readPrimusOnboardingSeen(): boolean {
  return localStorage.getItem(PRIMUS_ONBOARDING_SEEN_KEY) === "true";
}

// Primus oyun ekranını render eder
export function PrimusGame() {
  const {
    phase,
    playMode,
    board,
    gridSize,
    targetIndices,
    roundType,
    playerInput,
    wrongInputIndices,
    resultMap,
    score,
    remainingMs,
    roundHistory,
    levelComplete,
    level,
    levelConfig,
    handleCellClick,
    startRound,
    nextRound,
    skipBriefing,
    nextLevel,
    goToLevel,
    enterPractice,
    exitPractice,
  } = usePrimus();

  const [helpOpen, setHelpOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(
    () => !readPrimusOnboardingSeen(),
  );
  const [showLevelSelect, setShowLevelSelect] = useState(false);

  const isPractice = playMode === "practice";
  const roundAverage = calculateRoundAverage(roundHistory);
  const formattedAverage = roundAverage.toFixed(1);
  const showBoard = board.length > 0 && phase !== "briefing";
  const remainingSelections = Math.max(
    0,
    targetIndices.length - (playerInput.length + wrongInputIndices.length),
  );
  const targetValues = targetIndices
    .map((index) => board[index])
    .sort((a, b) => a - b);
  const targetsLabel = formatTargetsLabel(targetValues, roundType);
  const taskLabel = getRoundTaskLabel(roundType);
  const resultErrors =
    phase === "result"
      ? buildResultErrors(
          board,
          targetIndices,
          wrongInputIndices,
          resultMap,
          roundType,
        )
      : { missed: [], wrong: [] };
  const hasResultErrors =
    resultErrors.missed.length > 0 || resultErrors.wrong.length > 0;
  const canAdvanceLevel =
    !isPractice && levelComplete && level < PRIMUS_MAX_LEVEL;

  // Bölüm seçimini uygular ve modalı kapatır
  const handleLevelSelect = (selectedLevel: number): void => {
    goToLevel(selectedLevel);
    setShowLevelSelect(false);
  };

  return (
    <>
      <PrimusHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      {showOnboarding && (
        <PrimusOnboarding onComplete={() => setShowOnboarding(false)} />
      )}

      {phase === "briefing" && (
        <PrimusBriefing roundType={roundType} onSkip={skipBriefing} />
      )}

      {showLevelSelect && !isPractice && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <PrimusLevelSelect
            currentLevel={level}
            onSelectLevel={handleLevelSelect}
            onClose={() => setShowLevelSelect(false)}
          />
        </div>
      )}

      <div className="flex h-svh min-h-0 flex-col overflow-hidden bg-mnemo-bg">
        <header className="mnemo-hud shrink-0 px-4 py-3">
          <div className="mx-auto flex w-full max-w-lg items-center justify-between overflow-x-auto gap-1.5 text-xs font-medium text-mnemo-hud sm:gap-3 sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <span className="whitespace-nowrap">
                {isPractice ? "Alıştırma" : `Bölüm: ${level}`}
              </span>
              <span className="whitespace-nowrap">Ort: %{formattedAverage}</span>
              <span className="whitespace-nowrap">Puan: %{score.toFixed(1)}</span>
              {!isPractice && (
                <span className="hidden whitespace-nowrap sm:inline">
                  {getQuestionModeLabel(levelConfig.questionMode)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {DEBUG_MODE && (
                <button
                  type="button"
                  className="whitespace-nowrap rounded-[6px] bg-[#2A2A45] px-2 py-1 text-xs text-[#6B6B8A] transition-colors hover:bg-[#3A3A60] hover:text-[#F0D9B5] active:scale-95"
                  onClick={() => {
                    if (isPractice) {
                      exitPractice();
                    } else {
                      enterPractice();
                    }
                  }}
                >
                  {isPractice ? "Kampanya" : "Alıştırma"}
                </button>
              )}
              {DEBUG_MODE && !isPractice && (
                <button
                  type="button"
                  className="whitespace-nowrap rounded-[6px] bg-[#2A2A45] px-2 py-1 text-xs text-[#6B6B8A] transition-colors hover:bg-[#3A3A60] hover:text-[#F0D9B5] active:scale-95"
                  onClick={() => setShowLevelSelect(true)}
                >
                  Bölümleri Gör
                </button>
              )}
              <PrimusHelpButton
                isOpen={helpOpen}
                onClick={() => setHelpOpen((previous) => !previous)}
              />
              <Link
                to="/"
                className="whitespace-nowrap rounded-[6px] border border-mnemo-border px-2 py-1 text-xs text-mnemo-hud transition-colors hover:bg-mnemo-cell-hover hover:text-white"
              >
                Ana Sayfa
              </Link>
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-3">
          {levelComplete && !isPractice ? (
            <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 rounded-[6px] border border-mnemo-border bg-mnemo-cell px-6 py-8 text-center">
              <h2 className="text-2xl font-semibold text-mnemo-primary-hover">
                Bölüm Tamamlandı!
              </h2>
              <p className="text-mnemo-hud">
                Son {MIN_ROUNDS_TO_COMPLETE} tur ortalaması: %{formattedAverage}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                {canAdvanceLevel && (
                  <button
                    type="button"
                    className={buttonClassName}
                    onClick={nextLevel}
                  >
                    Sonraki Bölüm
                  </button>
                )}
                <button
                  type="button"
                  className={secondaryButtonClassName}
                  onClick={() => setShowLevelSelect(true)}
                >
                  Bölüm Seç
                </button>
                {!canAdvanceLevel && (
                  <Link to="/" className={secondaryButtonClassName}>
                    Ana Sayfaya Dön
                  </Link>
                )}
              </div>
            </section>
          ) : (
            <div className="mx-auto flex h-full min-h-0 w-full max-w-lg flex-col">
              <div
                className={`flex shrink-0 flex-col items-center justify-center gap-0.5 px-1 ${
                  phase === "result" && hasResultErrors
                    ? "min-h-14 max-h-32 overflow-y-auto py-1"
                    : "h-14"
                }`}
              >
                <p
                  className={`text-center text-lg font-semibold text-white sm:text-xl ${
                    phase === "input" || phase === "result" ? "visible" : "invisible"
                  }`}
                >
                  {phase === "input"
                    ? taskLabel
                    : phase === "result"
                      ? targetsLabel
                      : " "}
                </p>
                {phase === "result" && hasResultErrors && (
                  <div className="w-full text-center text-xs text-mnemo-hud sm:text-sm">
                    <p className="font-medium text-white">Hatalar</p>
                    {resultErrors.missed.length > 0 && (
                      <p>Kaçırılanlar: {resultErrors.missed.join(", ")}</p>
                    )}
                    {resultErrors.wrong.length > 0 && (
                      <p>Yanlış seçimler: {resultErrors.wrong.join(", ")}</p>
                    )}
                  </div>
                )}
                <p
                  className={`text-sm text-mnemo-hud ${
                    phase === "input" ? "visible" : "invisible"
                  }`}
                >
                  {phase === "input"
                    ? `Kalan seçim: ${remainingSelections}`
                    : " "}
                </p>
              </div>

              <main className="relative min-h-0 w-full flex-1">
                {showBoard ? (
                  <div className="absolute inset-0 m-auto aspect-square max-h-full max-w-full">
                    <PrimusGrid
                      board={board}
                      gridSize={gridSize}
                      phase={phase}
                      playerInput={playerInput}
                      wrongInputIndices={wrongInputIndices}
                      resultMap={resultMap}
                      onCellClick={handleCellClick}
                    />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-mnemo-hud">
                    {phase === "briefing"
                      ? " "
                      : "Başlamak için aşağıdaki butona bas"}
                  </div>
                )}
              </main>

              <div className="flex h-[7.25rem] shrink-0 flex-col items-center justify-center gap-2 pt-1">
                {phase === "input" && (
                  <p className="text-sm text-mnemo-hud">
                    Kalan süre: {formatRemainingSeconds(remainingMs)} sn
                  </p>
                )}

                {phase === "result" && (
                  <button
                    type="button"
                    className={buttonClassName}
                    onClick={nextRound}
                  >
                    Sonraki Tur
                  </button>
                )}

                {phase === "idle" && (
                  <button
                    type="button"
                    className={buttonClassName}
                    onClick={startRound}
                  >
                    Başla
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
