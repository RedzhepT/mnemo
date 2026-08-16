import { Link } from "react-router-dom";
import { PrimusGrid } from "../components/primus/PrimusGrid";
import { usePrimus } from "../hooks/usePrimus";
import { MIN_ROUNDS_TO_COMPLETE } from "../utils/constants";

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

// Primus oyun ekranını render eder
export function PrimusGame() {
  const {
    phase,
    board,
    primeIndices,
    playerInput,
    wrongInputIndices,
    resultMap,
    score,
    remainingMs,
    roundHistory,
    levelComplete,
    level,
    handleCellClick,
    startRound,
    nextRound,
  } = usePrimus();

  const roundAverage = calculateRoundAverage(roundHistory);
  const formattedAverage = roundAverage.toFixed(1);
  const showBoard = board.length > 0;
  const sortedPrimes = primeIndices
    .map((index) => board[index])
    .sort((a, b) => a - b);
  const primesLabel =
    sortedPrimes.length > 0 ? `Asallar: ${sortedPrimes.join(", ")}` : " ";

  return (
    <div className="flex h-svh min-h-0 flex-col overflow-hidden bg-mnemo-bg">
      <header className="mnemo-hud shrink-0 px-4 py-3">
        <div className="mx-auto flex w-full max-w-lg items-center justify-between overflow-x-auto gap-1.5 text-xs font-medium text-mnemo-hud sm:gap-3 sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <span className="whitespace-nowrap">Bölüm: {level}</span>
            <span className="whitespace-nowrap">Ort: %{formattedAverage}</span>
            <span className="whitespace-nowrap">Puan: %{score.toFixed(1)}</span>
          </div>
          <Link
            to="/"
            className="whitespace-nowrap rounded-[6px] border border-mnemo-border px-2 py-1 text-xs text-mnemo-hud transition-colors hover:bg-mnemo-cell-hover hover:text-white"
          >
            Ana Sayfa
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-3">
        {levelComplete ? (
          <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 rounded-[6px] border border-mnemo-border bg-mnemo-cell px-6 py-8 text-center">
            <h2 className="text-2xl font-semibold text-mnemo-primary-hover">
              Bölüm Tamamlandı!
            </h2>
            <p className="text-mnemo-hud">
              Son {MIN_ROUNDS_TO_COMPLETE} tur ortalaması: %{formattedAverage}
            </p>
            <p className="text-sm text-mnemo-hud">
              Primus şu an tek seviyeli — yeni seviyeler yakında eklenecek.
            </p>
            <Link to="/" className={secondaryButtonClassName}>
              Ana Sayfaya Dön
            </Link>
          </section>
        ) : (
          <div className="mx-auto flex h-full min-h-0 w-full max-w-lg flex-col">
            <p
              className={`flex h-10 shrink-0 items-center justify-center text-lg font-semibold text-white sm:text-xl ${
                phase === "input"
                  ? "visible"
                  : phase === "result"
                    ? "visible text-base sm:text-lg"
                    : "invisible"
              }`}
            >
              {phase === "input"
                ? "Asal sayıları bul"
                : phase === "result"
                  ? primesLabel
                  : " "}
            </p>

            <main className="relative min-h-0 w-full flex-1">
              {showBoard ? (
                <div className="absolute inset-0 m-auto aspect-square max-h-full max-w-full">
                  <PrimusGrid
                    board={board}
                    phase={phase}
                    playerInput={playerInput}
                    wrongInputIndices={wrongInputIndices}
                    resultMap={resultMap}
                    onCellClick={handleCellClick}
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-mnemo-hud">
                  Başlamak için aşağıdaki butona bas
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
                <button type="button" className={buttonClassName} onClick={nextRound}>
                  Sonraki Tur
                </button>
              )}

              {phase === "idle" && (
                <button type="button" className={buttonClassName} onClick={startRound}>
                  Başla
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
