import { useEffect, useState } from "react";
import { Grid } from "./components/Grid";
import { HelpButton, HelpModal } from "./components/HelpModal";
import { LevelSelect } from "./components/LevelSelect";
import { Onboarding, ONBOARDING_SEEN_KEY } from "./components/Onboarding";
import { useGame, EMOJI_MAP } from "./hooks/useGame";
import { DEBUG_MODE, MAX_LEVEL } from "./utils/constants";
import { getLevelConfig } from "./utils/levels";

const debugButtonClassName =
  "rounded-[8px] bg-[#2A2A45] px-2 py-1.5 text-xs text-[#6B6B8A] transition-colors hover:bg-[#3A3A60] active:scale-95";

const secondaryButtonClassName =
  "rounded-[6px] border border-mnemo-border bg-mnemo-cell px-8 py-3 font-medium text-mnemo-hud transition-colors hover:bg-mnemo-cell-hover hover:text-white active:scale-95";

const buttonClassName =
  "rounded-[6px] bg-mnemo-primary px-8 py-3 font-medium text-white transition-colors hover:bg-mnemo-primary-hover active:scale-95";

const SAVE_KEY = "mnemo_save";

// Kayıtlı ilerlemeyi siler ve sayfayı yeniler
function handleResetLevel(): void {
  localStorage.removeItem(SAVE_KEY);
  window.location.reload();
}

// Tur geçmişinin ortalama puanını hesaplar
function calculateRoundAverage(roundHistory: number[]): number {
  if (roundHistory.length === 0) {
    return 0;
  }

  return (
    roundHistory.reduce((sum, value) => sum + value, 0) / roundHistory.length
  );
}

function App() {
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const {
    phase,
    sequence,
    playerInput,
    allPlayerInputs,
    activeIndex,
    score,
    level,
    resultMap,
    roundHistory,
    roundCount,
    isPaused,
    levelComplete,
    emojiSequence,
    currentInputCategory,
    activeCategoryEmojis,
    handleCellClick,
    startGame,
    nextLevel,
    pauseGame,
    resumeGame,
    jumpToLevel,
    selectLevelAndStart,
  } = useGame();

  const { gridSize, mode } = getLevelConfig(level);
  const isEmojiMode = mode === "emoji";
  const roundAverage = calculateRoundAverage(roundHistory);
  const formattedAverage = roundAverage.toFixed(1);
  const showStartButton = phase === "idle" && !isPaused;
  const showPauseButton =
    !isPaused &&
    (phase === "showing" || phase === "input" || phase === "result");

  const handleLevelSelect = (targetLevel: number): void => {
    selectLevelAndStart(targetLevel);
    setShowLevelSelect(false);
  };

  useEffect(() => {
    if (localStorage.getItem(ONBOARDING_SEEN_KEY) !== "true") {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    if (levelComplete) {
      setShowLevelSelect(false);
    }
  }, [levelComplete]);

  const showEmojiInfo = isEmojiMode && activeCategoryEmojis !== null;
  const showClickPrompt =
    isEmojiMode && phase === "input" && currentInputCategory !== null;

  return (
    <>
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}

      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      <div className="flex h-svh min-h-0 flex-col overflow-hidden bg-mnemo-bg">
        <header className="mnemo-hud shrink-0 px-4 py-3">
          <div className="mx-auto flex w-full max-w-lg items-center justify-center gap-3 text-sm font-medium text-mnemo-hud sm:gap-4 sm:text-base">
            <span className="whitespace-nowrap">Bölüm: {level}</span>
            <span className="whitespace-nowrap">Ort: %{formattedAverage}</span>
            <span className="whitespace-nowrap">Puan: %{score.toFixed(1)}</span>
            <HelpButton
              isOpen={helpOpen}
              onClick={() => setHelpOpen((previous) => !previous)}
            />
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-3">
          {isPaused ? (
            <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 rounded-[6px] border border-mnemo-border bg-mnemo-cell px-6 py-8 text-center">
            <h2 className="text-2xl font-semibold text-white">
              Oyun duraklatıldı
            </h2>
            <p className="text-mnemo-hud">Tamamlanan tur: {roundCount}</p>
            <p className="text-mnemo-hud">
              Son 10 tur ortalaması: %{formattedAverage}
            </p>
            <button
              type="button"
              className={buttonClassName}
              onClick={resumeGame}
            >
              Devam Et
            </button>
          </section>
          ) : levelComplete && !isPaused ? (
            <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 rounded-[6px] border border-mnemo-border bg-mnemo-cell px-6 py-8 text-center">
            <h2 className="text-2xl font-semibold text-mnemo-primary-hover">
              Bölüm Tamamlandı!
            </h2>
            <p className="text-mnemo-hud">
              Son 10 tur ortalaması: %{formattedAverage}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className={buttonClassName}
                onClick={nextLevel}
              >
                Sonraki Bölüm
              </button>
              <button
                type="button"
                className={secondaryButtonClassName}
                onClick={() => setShowLevelSelect(true)}
              >
                Bölüm Seç
              </button>
            </div>
            </section>
          ) : (
            <div className="mx-auto flex h-full min-h-0 w-full max-w-lg flex-col">
              <p
                className={`flex h-5 shrink-0 items-center justify-center text-sm text-mnemo-hud ${
                  showEmojiInfo ? "visible" : "invisible"
                }`}
              >
                {showEmojiInfo && activeCategoryEmojis !== null
                  ? `Bölüm emojileri: ${EMOJI_MAP[activeCategoryEmojis[0]]} ${EMOJI_MAP[activeCategoryEmojis[1]]}`
                  : " "}
              </p>

              <p
                className={`flex h-10 shrink-0 items-center justify-center text-xl font-semibold text-white sm:text-2xl ${
                  showClickPrompt ? "visible" : "invisible"
                }`}
              >
                {showClickPrompt && currentInputCategory !== null
                  ? `Şimdi tıkla: ${EMOJI_MAP[currentInputCategory]}`
                  : " "}
              </p>

              <main className="relative min-h-0 w-full flex-1">
                <div className="absolute inset-0 m-auto aspect-square max-h-full max-w-full">
                  <Grid
                    gridSize={gridSize}
                    sequence={sequence}
                    playerInput={playerInput}
                    allPlayerInputs={allPlayerInputs}
                    phase={phase}
                    activeIndex={activeIndex}
                    resultMap={resultMap}
                    emojiSequence={emojiSequence}
                    isEmojiMode={isEmojiMode}
                    currentInputCategory={currentInputCategory}
                    onCellClick={handleCellClick}
                  />
                </div>
              </main>

              <div className="flex h-[7.25rem] shrink-0 flex-col items-center justify-center gap-2 pt-1">
                {phase === "result" && (
                  <button
                    type="button"
                    className={buttonClassName}
                    onClick={startGame}
                  >
                    Sonraki Tur
                  </button>
                )}

                {showStartButton && (
                  <button
                    type="button"
                    className={buttonClassName}
                    onClick={startGame}
                  >
                    Başla
                  </button>
                )}

                {showPauseButton && (
                  <button
                    type="button"
                    className="rounded-[6px] border border-mnemo-border bg-mnemo-cell px-8 py-3 font-medium text-mnemo-hud transition-colors hover:bg-mnemo-cell-hover hover:text-white active:scale-95"
                    onClick={pauseGame}
                  >
                    Ara Ver
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showLevelSelect && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <LevelSelect
            currentLevel={level}
            onSelectLevel={handleLevelSelect}
            onClose={() => setShowLevelSelect(false)}
          />
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {DEBUG_MODE && (
          <>
            <button
              type="button"
              className={debugButtonClassName}
              onClick={() => setShowLevelSelect((previous) => !previous)}
            >
              {showLevelSelect ? "Gizle" : "Bölümleri Gör"}
            </button>

            <label className="flex items-center gap-2 rounded-[8px] bg-[#2A2A45] px-2 py-1.5 text-xs text-[#6B6B8A]">
              Bölüm:
              <input
                type="number"
                min={1}
                max={MAX_LEVEL}
                value={level}
                onChange={(event) => jumpToLevel(Number(event.target.value))}
                className="w-12 rounded bg-[#1A1A2E] px-1 py-0.5 text-center text-[#6B6B8A] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </label>
          </>
        )}

        <button
          type="button"
          title="Bölümü Sıfırla"
          aria-label="Bölümü Sıfırla"
          className="rounded-[8px] bg-[#2A2A45] p-[10px] text-[#6B6B8A] transition-colors hover:bg-[#3A3A60] active:scale-95"
          onClick={handleResetLevel}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>
      </div>
    </>
  );
}

export default App;
