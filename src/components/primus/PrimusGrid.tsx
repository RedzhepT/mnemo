import { PRIMUS_GRID_SIZE } from "../../utils/constants";
import type { PrimusPhase, PrimusResultMap } from "../../hooks/usePrimus";
import { PrimusCell } from "./PrimusCell";

export interface PrimusGridProps {
  board: number[];
  phase: PrimusPhase;
  playerInput: number[];
  wrongInputIndices: number[];
  resultMap: PrimusResultMap;
  onCellClick: (index: number) => void;
}

// 4×4 Primus sayı tahtasını render eder
export function PrimusGrid({
  board,
  phase,
  playerInput,
  wrongInputIndices,
  resultMap,
  onCellClick,
}: PrimusGridProps) {
  const selectedIndices = new Set([...playerInput, ...wrongInputIndices]);

  return (
    <div
      className="grid h-full w-full gap-1"
      style={{
        gridTemplateColumns: `repeat(${PRIMUS_GRID_SIZE}, minmax(0, 1fr))`,
      }}
    >
      {board.map((value, index) => (
        <PrimusCell
          key={index}
          index={index}
          gridSize={PRIMUS_GRID_SIZE}
          value={value}
          phase={phase}
          isSelected={selectedIndices.has(index)}
          resultStatus={resultMap[index] ?? null}
          onClick={onCellClick}
        />
      ))}
    </div>
  );
}
