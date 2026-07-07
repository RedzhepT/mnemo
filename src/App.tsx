import { Grid } from "./components/Grid";
import { useGame, type EmojiType } from "./hooks/useGame";
import { DEBUG_MODE, MAX_LEVEL } from "./utils/constants";
import { getLevelConfig } from "./utils/levels";

const buttonClassName =
  "rounded-[6px] bg-mnemo-primary px-8 py-3 font-medium text-white transition-colors hover:bg-mnemo-primary-hover active:scale-95";

const SAVE_KEY = "mnemo_save";

const CATEGORY_EMOJI: Record<EmojiType, string> = {
  cat: "🐱",
  bear: "🐻",
};

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
  const {
    phase,
    sequence,
    playerInput,
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
    handleCellClick,
    startGame,
    nextLevel,
    pauseGame,
    resumeGame,
    jumpToLevel,
  } = useGame();

  const { gridSize, mode } = getLevelConfig(level);
  const isEmojiMode = mode === "emoji";
  const roundAverage = calculateRoundAverage(roundHistory);
  const formattedAverage = roundAverage.toFixed(1);
  const showStartButton = phase === "idle" && !isPaused;
  const showPauseButton =
    !isPaused &&
    (phase === "showing" || phase === "input" || phase === "result");

  return (
    <>
      <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-mnemo-bg px-4 py-8">
        <header className="flex w-full max-w-md items-center justify-between gap-4 text-lg font-medium text-mnemo-hud">
          <span>Bölüm: {level}</span>
          <span>Ort: %{formattedAverage}</span>
          <span>Puan: %{score.toFixed(1)}</span>
        </header>

        {isPaused ? (
          <section className="flex w-full max-w-md flex-col items-center gap-6 rounded-[6px] border border-mnemo-border bg-mnemo-cell px-6 py-10 text-center">
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
        ) : levelComplete === true ? (
          <section className="flex w-full max-w-md flex-col items-center gap-6 rounded-[6px] border border-mnemo-border bg-mnemo-cell px-6 py-10 text-center">
            <h2 className="text-2xl font-semibold text-mnemo-primary-hover">
              Bölüm Tamamlandı!
            </h2>
            <p className="text-mnemo-hud">
              Son 10 tur ortalaması: %{formattedAverage}
            </p>
            <button
              type="button"
              className={buttonClassName}
              onClick={nextLevel}
            >
              Sonraki Bölüm
            </button>
          </section>
        ) : (
          <>
            {isEmojiMode &&
              phase === "input" &&
              currentInputCategory !== null && (
                <p className="text-2xl font-semibold text-white">
                  Şimdi tıkla: {CATEGORY_EMOJI[currentInputCategory]}
                </p>
              )}

            <main className="w-full">
              <Grid
                gridSize={gridSize}
                sequence={sequence}
                playerInput={playerInput}
                phase={phase}
                activeIndex={activeIndex}
                resultMap={resultMap}
                emojiSequence={emojiSequence}
                isEmojiMode={isEmojiMode}
                currentInputCategory={currentInputCategory}
                onCellClick={handleCellClick}
              />
            </main>

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
          </>
        )}
      </div>

      <div className="fixed bottom-4 right-4 flex flex-col items-end gap-2">
        {DEBUG_MODE && (
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
