import {
  PRIMUS_ONE_DIGIT_MAX,
  PRIMUS_ONE_DIGIT_MIN,
  PRIMUS_ROUND_TYPE_WINDOW,
  PRIMUS_THREE_DIGIT_MAX,
  PRIMUS_THREE_DIGIT_MIN,
  PRIMUS_TWO_DIGIT_MAX,
  PRIMUS_TWO_DIGIT_MIN,
} from "../constants";
import type { PrimusDigitMode } from "./levels";

export type PrimusRoundType = "asal" | "kare" | "kup" | "kareKup";

export interface PrimusBoard {
  values: number[];
  targetIndices: number[];
  roundType: PrimusRoundType;
}

export interface PrimusBoardGenerateConfig {
  gridSize: number;
  targetCount: number;
  roundType: PrimusRoundType;
  digitMode: PrimusDigitMode;
  oneDigitMin: number;
  oneDigitMax: number;
}

export interface NearestSquareCube {
  root: number;
  power: 2 | 3;
  result: number;
}

export interface PrimusResultErrors {
  missed: string[];
  wrong: string[];
}

interface DigitSplit {
  oneDigit: number;
  twoDigit: number;
  threeDigit: number;
}

// Sayının asal olup olmadığını kontrol eder
export function isPrime(n: number): boolean {
  if (n < 2) {
    return false;
  }

  if (n === 2) {
    return true;
  }

  if (n % 2 === 0) {
    return false;
  }

  for (let divisor = 3; divisor * divisor <= n; divisor += 2) {
    if (n % divisor === 0) {
      return false;
    }
  }

  return true;
}

// Sayının tam kare olup olmadığını kontrol eder (1 hariç)
export function isPerfectSquare(n: number): boolean {
  if (n < 2) {
    return false;
  }

  const root = Math.sqrt(n);
  return Number.isInteger(root);
}

// Sayının tam küp olup olmadığını kontrol eder (1 hariç)
export function isPerfectCube(n: number): boolean {
  if (n < 2) {
    return false;
  }

  const root = Math.round(Math.pow(n, 1 / 3));
  return root ** 3 === n;
}

// Kare veya küp hedefi olup olmadığını kontrol eder
export function isSquareOrCube(n: number): boolean {
  return isPerfectSquare(n) || isPerfectCube(n);
}

// Diziyi Fisher-Yates ile karıştırır
function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

// Diziden rastgele belirtilen sayıda eleman seçer
function pickRandomItems<T>(items: T[], count: number): T[] {
  if (count <= 0) {
    return [];
  }

  return shuffleArray(items).slice(0, Math.min(count, items.length));
}

// Aralıkta predicate'e uyan sayıları döner (1 hariç)
function collectNumbers(
  min: number,
  max: number,
  predicate: (value: number) => boolean,
  exclude: Set<number> = new Set(),
): number[] {
  const values: number[] = [];

  for (let value = min; value <= max; value += 1) {
    if (value === 1 || exclude.has(value)) {
      continue;
    }

    if (predicate(value)) {
      values.push(value);
    }
  }

  return values;
}

// Basamak moduna göre tek / iki / üç basamak hücre dağılımını seçer
function pickDigitSplit(
  cellCount: number,
  digitMode: PrimusDigitMode,
  oneDigitMin: number,
  oneDigitMax: number,
): DigitSplit {
  if (digitMode === "threeOnly") {
    return { oneDigit: 0, twoDigit: 0, threeDigit: cellCount };
  }

  if (digitMode === "twoOnly") {
    const maxOne = Math.min(oneDigitMax, cellCount);
    const minOne = Math.min(oneDigitMin, maxOne);
    const oneDigit =
      minOne + Math.floor(Math.random() * (maxOne - minOne + 1));
    return { oneDigit, twoDigit: cellCount - oneDigit, threeDigit: 0 };
  }

  if (digitMode === "mix2_3") {
    const threeDigitMin = Math.max(1, Math.floor(cellCount * 0.25));
    const threeDigitMax = Math.max(threeDigitMin, Math.floor(cellCount * 0.55));
    const threeDigit =
      threeDigitMin +
      Math.floor(Math.random() * (threeDigitMax - threeDigitMin + 1));
    return {
      oneDigit: 0,
      twoDigit: cellCount - threeDigit,
      threeDigit,
    };
  }

  // weightedOne | mix1_2 | weightedTwo — tek basamak min–max aralığında
  const maxOne = Math.min(oneDigitMax, cellCount);
  const minOne = Math.min(Math.max(oneDigitMin, 0), maxOne);
  let oneDigit = minOne + Math.floor(Math.random() * (maxOne - minOne + 1));

  if (digitMode === "weightedOne") {
    oneDigit = Math.max(oneDigit, Math.min(maxOne, Math.ceil(cellCount * 0.6)));
  }

  if (digitMode === "weightedTwo") {
    oneDigit = Math.min(oneDigit, Math.max(minOne, Math.floor(cellCount * 0.25)));
  }

  // 3×3'te 2–9 yalnızca 8 benzersiz sayı → en az 1 iki basamak gerekebilir
  if (cellCount > 8 && oneDigit > 8) {
    oneDigit = 8;
  }

  return { oneDigit, twoDigit: cellCount - oneDigit, threeDigit: 0 };
}

// Hedef predicate'ini tur tipine göre döner
function getTargetPredicate(
  roundType: PrimusRoundType,
): (value: number) => boolean {
  if (roundType === "asal") {
    return isPrime;
  }

  if (roundType === "kare") {
    return isPerfectSquare;
  }

  if (roundType === "kup") {
    return isPerfectCube;
  }

  return isSquareOrCube;
}

// Doldurucu (hedef dışı) predicate'ini tur tipine göre döner
function getFillerPredicate(
  roundType: PrimusRoundType,
): (value: number) => boolean {
  if (roundType === "asal") {
    return (value) => !isPrime(value);
  }

  if (roundType === "kare") {
    // Hedef dışı küp olabilir; kare olamaz
    return (value) => !isPerfectSquare(value);
  }

  if (roundType === "kup") {
    // Hedef dışı kare olabilir; küp olamaz
    return (value) => !isPerfectCube(value);
  }

  return (value) => !isSquareOrCube(value);
}

// Belirli basamak havuzundan hedef ve doldurucu seçer
function pickFromPools(
  targetCount: number,
  oneDigitCount: number,
  twoDigitCount: number,
  threeDigitCount: number,
  isTarget: (value: number) => boolean,
  isFiller: (value: number) => boolean,
): number[] {
  const exclude = new Set<number>();

  const oneTargetsPool = collectNumbers(
    PRIMUS_ONE_DIGIT_MIN,
    PRIMUS_ONE_DIGIT_MAX,
    isTarget,
  );
  const twoTargetsPool = collectNumbers(
    PRIMUS_TWO_DIGIT_MIN,
    PRIMUS_TWO_DIGIT_MAX,
    isTarget,
  );
  const threeTargetsPool = collectNumbers(
    PRIMUS_THREE_DIGIT_MIN,
    PRIMUS_THREE_DIGIT_MAX,
    isTarget,
  );

  const maxOneTargets = Math.min(targetCount, oneDigitCount, oneTargetsPool.length);
  const maxThreeTargets = Math.min(
    targetCount,
    threeDigitCount,
    threeTargetsPool.length,
  );
  const maxTwoTargets = Math.min(
    targetCount,
    twoDigitCount,
    twoTargetsPool.length,
  );

  // Önce üç / tek basamak hedefleri sınırla; kalanı iki basamağa ver
  let oneTargetCount = 0;
  let threeTargetCount = 0;

  if (oneDigitCount > 0 && maxOneTargets > 0) {
    const minOneTargets = Math.max(
      0,
      targetCount - twoDigitCount - threeDigitCount,
    );
    oneTargetCount =
      minOneTargets +
      Math.floor(
        Math.random() * (Math.max(minOneTargets, maxOneTargets) - minOneTargets + 1),
      );
    oneTargetCount = Math.min(oneTargetCount, maxOneTargets);
  }

  const remainingAfterOne = targetCount - oneTargetCount;

  if (threeDigitCount > 0 && maxThreeTargets > 0) {
    const minThreeTargets = Math.max(0, remainingAfterOne - twoDigitCount);
    threeTargetCount =
      minThreeTargets +
      Math.floor(
        Math.random() *
          (Math.max(minThreeTargets, Math.min(maxThreeTargets, remainingAfterOne)) -
            minThreeTargets +
            1),
      );
    threeTargetCount = Math.min(threeTargetCount, maxThreeTargets, remainingAfterOne);
  }

  let twoTargetCount = targetCount - oneTargetCount - threeTargetCount;
  twoTargetCount = Math.min(twoTargetCount, maxTwoTargets);

  // Yetersiz havuzda yeniden dengele
  const shortfall =
    targetCount - (oneTargetCount + twoTargetCount + threeTargetCount);
  if (shortfall > 0 && twoTargetsPool.length > twoTargetCount) {
    twoTargetCount = Math.min(
      twoTargetCount + shortfall,
      twoTargetsPool.length,
      twoDigitCount,
    );
  }

  const selectedTargets = [
    ...pickRandomItems(oneTargetsPool, oneTargetCount),
    ...pickRandomItems(twoTargetsPool, twoTargetCount),
    ...pickRandomItems(threeTargetsPool, threeTargetCount),
  ];

  for (const value of selectedTargets) {
    exclude.add(value);
  }

  // Eksik hedef varsa herhangi uygun havuzdan tamamla
  while (selectedTargets.length < targetCount) {
    const fallbackPool = [
      ...collectNumbers(PRIMUS_ONE_DIGIT_MIN, PRIMUS_ONE_DIGIT_MAX, isTarget, exclude),
      ...collectNumbers(PRIMUS_TWO_DIGIT_MIN, PRIMUS_TWO_DIGIT_MAX, isTarget, exclude),
      ...collectNumbers(PRIMUS_THREE_DIGIT_MIN, PRIMUS_THREE_DIGIT_MAX, isTarget, exclude),
    ];

    if (fallbackPool.length === 0) {
      break;
    }

    const [picked] = pickRandomItems(fallbackPool, 1);
    selectedTargets.push(picked);
    exclude.add(picked);
  }

  const oneFillerCount = Math.max(0, oneDigitCount - oneTargetCount);
  const twoFillerCount = Math.max(0, twoDigitCount - twoTargetCount);
  const threeFillerCount = Math.max(0, threeDigitCount - threeTargetCount);

  const oneFillers = pickRandomItems(
    collectNumbers(PRIMUS_ONE_DIGIT_MIN, PRIMUS_ONE_DIGIT_MAX, isFiller, exclude),
    oneFillerCount,
  );
  for (const value of oneFillers) {
    exclude.add(value);
  }

  const twoFillers = pickRandomItems(
    collectNumbers(PRIMUS_TWO_DIGIT_MIN, PRIMUS_TWO_DIGIT_MAX, isFiller, exclude),
    twoFillerCount,
  );
  for (const value of twoFillers) {
    exclude.add(value);
  }

  const threeFillers = pickRandomItems(
    collectNumbers(PRIMUS_THREE_DIGIT_MIN, PRIMUS_THREE_DIGIT_MAX, isFiller, exclude),
    threeFillerCount,
  );

  let values = [
    ...selectedTargets,
    ...oneFillers,
    ...twoFillers,
    ...threeFillers,
  ];

  // Hücre sayısı tutmuyorsa doldurucu ekle
  while (values.length < oneDigitCount + twoDigitCount + threeDigitCount) {
    const need = oneDigitCount + twoDigitCount + threeDigitCount - values.length;
    const more = pickRandomItems(
      [
        ...collectNumbers(PRIMUS_TWO_DIGIT_MIN, PRIMUS_TWO_DIGIT_MAX, isFiller, exclude),
        ...collectNumbers(PRIMUS_THREE_DIGIT_MIN, PRIMUS_THREE_DIGIT_MAX, isFiller, exclude),
        ...collectNumbers(PRIMUS_ONE_DIGIT_MIN, PRIMUS_ONE_DIGIT_MAX, isFiller, exclude),
      ],
      need,
    );

    if (more.length === 0) {
      break;
    }

    for (const value of more) {
      exclude.add(value);
      values.push(value);
    }
  }

  values = shuffleArray(values).slice(
    0,
    oneDigitCount + twoDigitCount + threeDigitCount,
  );

  return values;
}

// Config'e göre Primus tahtası üretir
export function generateBoard(config: PrimusBoardGenerateConfig): PrimusBoard {
  const cellCount = config.gridSize * config.gridSize;
  const split = pickDigitSplit(
    cellCount,
    config.digitMode,
    config.oneDigitMin,
    config.oneDigitMax,
  );
  const isTarget = getTargetPredicate(config.roundType);
  const isFiller = getFillerPredicate(config.roundType);

  const values = pickFromPools(
    config.targetCount,
    split.oneDigit,
    split.twoDigit,
    split.threeDigit,
    isTarget,
    isFiller,
  );

  const targetIndices = values
    .map((value, index) => (isTarget(value) ? index : -1))
    .filter((index) => index >= 0);

  return {
    values,
    targetIndices,
    roundType: config.roundType,
  };
}

// Alıştırma: son 5 turda asal ve kareKup en az bir kez (yalnızca practice)
export function pickRoundType(recentTypes: PrimusRoundType[]): PrimusRoundType {
  const window = recentTypes
    .filter((type) => type === "asal" || type === "kareKup")
    .slice(-PRIMUS_ROUND_TYPE_WINDOW);

  if (window.length < PRIMUS_ROUND_TYPE_WINDOW) {
    return Math.random() < 0.5 ? "asal" : "kareKup";
  }

  const hasAsal = window.some((type) => type === "asal");
  const hasKareKup = window.some((type) => type === "kareKup");

  if (!hasAsal) {
    return "asal";
  }

  if (!hasKareKup) {
    return "kareKup";
  }

  return Math.random() < 0.5 ? "asal" : "kareKup";
}

// Kare hedefini üslü gösterimle formatlar
export function formatSquareTarget(value: number): string {
  const squareRoot = Math.sqrt(value);
  return `${squareRoot}² = ${value}`;
}

// Küp hedefini üslü gösterimle formatlar
export function formatCubeTarget(value: number): string {
  const cubeRoot = Math.round(Math.pow(value, 1 / 3));
  return `${cubeRoot}³ = ${value}`;
}

// Kare/küp hedefini üslü gösterimle formatlar
export function formatSquareCubeTarget(value: number): string {
  if (isPerfectCube(value)) {
    return formatCubeTarget(value);
  }

  return formatSquareTarget(value);
}

// Tur tipine göre hedef listesini result metni için formatlar
export function formatTargetsLabel(
  values: number[],
  roundType: PrimusRoundType,
): string {
  const sortedValues = [...values].sort((a, b) => a - b);

  if (sortedValues.length === 0) {
    return " ";
  }

  const formattedValues =
    roundType === "asal"
      ? sortedValues.map(String)
      : roundType === "kare"
        ? sortedValues.map(formatSquareTarget)
        : roundType === "kup"
          ? sortedValues.map(formatCubeTarget)
          : sortedValues.map(formatSquareCubeTarget);

  return `Hedefler: ${formattedValues.join(", ")}`;
}

// En küçük asal böleni döner
function getSmallestPrimeFactor(value: number): number {
  if (value < 2) {
    return value;
  }

  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) {
      return divisor;
    }
  }

  return value;
}

// Sayıya en yakın tam kareyi döner
export function nearestPerfectSquare(value: number): NearestSquareCube {
  const approx = Math.max(2, Math.round(Math.sqrt(value)));
  const candidates: NearestSquareCube[] = [];

  for (let root = Math.max(2, approx - 2); root <= approx + 2; root += 1) {
    candidates.push({ root, power: 2, result: root ** 2 });
  }

  return candidates.reduce((best, candidate) => {
    const candidateDiff = Math.abs(value - candidate.result);
    const bestDiff = Math.abs(value - best.result);

    if (candidateDiff < bestDiff) {
      return candidate;
    }

    if (candidateDiff === bestDiff && candidate.result < best.result) {
      return candidate;
    }

    return best;
  });
}

// Sayıya en yakın tam küpü döner
export function nearestPerfectCube(value: number): NearestSquareCube {
  const approx = Math.max(2, Math.round(Math.pow(value, 1 / 3)));
  const candidates: NearestSquareCube[] = [];

  for (let root = Math.max(2, approx - 2); root <= approx + 2; root += 1) {
    candidates.push({ root, power: 3, result: root ** 3 });
  }

  return candidates.reduce((best, candidate) => {
    const candidateDiff = Math.abs(value - candidate.result);
    const bestDiff = Math.abs(value - best.result);

    if (candidateDiff < bestDiff) {
      return candidate;
    }

    if (candidateDiff === bestDiff && candidate.result < best.result) {
      return candidate;
    }

    return best;
  });
}

// Sayıya en yakın tam kare veya tam küpü döner
export function nearestSquareCube(value: number): NearestSquareCube {
  const square = nearestPerfectSquare(value);
  const cube = nearestPerfectCube(value);
  const squareDiff = Math.abs(value - square.result);
  const cubeDiff = Math.abs(value - cube.result);

  if (cubeDiff < squareDiff) {
    return cube;
  }

  if (cubeDiff === squareDiff && cube.result < square.result) {
    return cube;
  }

  return square;
}

// Asal turu yanlış seçim metnini formatlar
function formatPrimeWrongSelection(value: number): string {
  const smallestFactor = getSmallestPrimeFactor(value);
  const otherFactor = value / smallestFactor;

  return `${value} → ${smallestFactor} × ${otherFactor} = ${value}`;
}

// En yakın aday metnini formatlar
function formatNearestLabel(nearest: NearestSquareCube): string {
  const powerSymbol = nearest.power === 3 ? "³" : "²";
  return `${nearest.root}${powerSymbol} = ${nearest.result}`;
}

// Yanlış seçim metnini tur tipine göre formatlar
export function formatWrongSelection(
  value: number,
  roundType: PrimusRoundType,
): string {
  if (roundType === "asal") {
    return formatPrimeWrongSelection(value);
  }

  if (roundType === "kare") {
    return `${value} → ${formatNearestLabel(nearestPerfectSquare(value))}`;
  }

  if (roundType === "kup") {
    return `${value} → ${formatNearestLabel(nearestPerfectCube(value))}`;
  }

  return `${value} → ${formatNearestLabel(nearestSquareCube(value))}`;
}

// Kaçırılan hedef metnini tur tipine göre formatlar
export function formatMissedTarget(
  value: number,
  roundType: PrimusRoundType,
): string {
  if (roundType === "asal") {
    return `${value} — asal sayı`;
  }

  if (roundType === "kare") {
    return `${value} → ${formatSquareTarget(value)}`;
  }

  if (roundType === "kup") {
    return `${value} → ${formatCubeTarget(value)}`;
  }

  return `${value} → ${formatSquareCubeTarget(value)}`;
}

// Result fazı Hatalar alt başlıklarını oluşturur
export function buildResultErrors(
  board: number[],
  targetIndices: number[],
  wrongInputIndices: number[],
  resultMap: Record<number, "correct" | "wrong" | "missed">,
  roundType: PrimusRoundType,
): PrimusResultErrors {
  const missed = targetIndices
    .filter((index) => resultMap[index] === "missed")
    .map((index) => board[index])
    .sort((a, b) => a - b)
    .map((value) => formatMissedTarget(value, roundType));

  const wrong = wrongInputIndices
    .map((index) => board[index])
    .sort((a, b) => a - b)
    .map((value) => formatWrongSelection(value, roundType));

  return { missed, wrong };
}

// Briefing / görev metnini tur tipine göre döner
export function getRoundTaskLabel(roundType: PrimusRoundType): string {
  switch (roundType) {
    case "asal":
      return "Asal sayıları bul";
    case "kare":
      return "Kareleri bul";
    case "kup":
      return "Küpleri bul";
    case "kareKup":
      return "Kare ve küpleri bul";
  }
}

// Briefing fazı kısa örnek metnini tur tipine göre döner
export function getBriefingExample(roundType: PrimusRoundType): string {
  switch (roundType) {
    case "asal":
      return "2, 3, 11";
    case "kare":
      return "2² = 4";
    case "kup":
      return "3³ = 27";
    case "kareKup":
      return "2² = 4, 3³ = 27";
  }
}
