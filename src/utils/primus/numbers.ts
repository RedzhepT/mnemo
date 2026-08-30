import {
  PRIMUS_CELL_COUNT,
  PRIMUS_MAX_ONE_DIGIT_COUNT,
  PRIMUS_MIN_ONE_DIGIT_COUNT,
  PRIMUS_ONE_DIGIT_MAX,
  PRIMUS_ONE_DIGIT_MIN,
  PRIMUS_ROUND_TYPE_WINDOW,
  PRIMUS_TARGET_COUNT,
  PRIMUS_TWO_DIGIT_MAX,
  PRIMUS_TWO_DIGIT_MIN,
} from "../constants";

export type PrimusRoundType = "asal" | "kareKup";

export interface PrimusBoard {
  values: number[];
  targetIndices: number[];
  roundType: PrimusRoundType;
}

export interface GenerateBoardConfig {
  cellCount?: number;
  targetCount?: number;
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

// 2–9 arası asal sayıları döner
export function generateOneDigitPrimes(): number[] {
  const primes: number[] = [];

  for (let value = PRIMUS_ONE_DIGIT_MIN; value <= PRIMUS_ONE_DIGIT_MAX; value += 1) {
    if (isPrime(value)) {
      primes.push(value);
    }
  }

  return primes;
}

// 2–9 arası bileşik sayıları döner
export function generateOneDigitComposites(): number[] {
  const composites: number[] = [];

  for (let value = PRIMUS_ONE_DIGIT_MIN; value <= PRIMUS_ONE_DIGIT_MAX; value += 1) {
    if (!isPrime(value)) {
      composites.push(value);
    }
  }

  return composites;
}

// 10–99 arası tüm asal sayıları döner
export function generateTwoDigitPrimes(): number[] {
  const primes: number[] = [];

  for (let value = PRIMUS_TWO_DIGIT_MIN; value <= PRIMUS_TWO_DIGIT_MAX; value += 1) {
    if (isPrime(value)) {
      primes.push(value);
    }
  }

  return primes;
}

// Verilen sayılar dışındaki 2 basamaklı bileşik sayıları döner
export function generateTwoDigitComposites(exclude: number[]): number[] {
  const excludeSet = new Set(exclude);
  const composites: number[] = [];

  for (let value = PRIMUS_TWO_DIGIT_MIN; value <= PRIMUS_TWO_DIGIT_MAX; value += 1) {
    if (!isPrime(value) && !excludeSet.has(value)) {
      composites.push(value);
    }
  }

  return composites;
}

// Aralıktaki kare/küp sayılarını döner (1 hariç)
function getSquareOrCubeNumbers(
  min: number,
  max: number,
): number[] {
  const values: number[] = [];

  for (let value = min; value <= max; value += 1) {
    if (value === 1) {
      continue;
    }

    if (isSquareOrCube(value)) {
      values.push(value);
    }
  }

  return values;
}

// Aralıktaki kare/küp olmayan sayıları döner (1 hariç)
function getNonSquareCubeNumbers(
  min: number,
  max: number,
  exclude: number[] = [],
): number[] {
  const excludeSet = new Set(exclude);
  const values: number[] = [];

  for (let value = min; value <= max; value += 1) {
    if (value === 1 || excludeSet.has(value)) {
      continue;
    }

    if (!isSquareOrCube(value)) {
      values.push(value);
    }
  }

  return values;
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
  return shuffleArray(items).slice(0, count);
}

// Tek basamaklı hücre sayısını 3–8 aralığında, uygulanabilir üst sınırla seçer
function pickOneDigitCount(): number {
  const oneDigitComposites = generateOneDigitComposites().length;
  const maxFeasible = Math.min(
    PRIMUS_MAX_ONE_DIGIT_COUNT,
    PRIMUS_TARGET_COUNT + oneDigitComposites,
  );
  const minCount = PRIMUS_MIN_ONE_DIGIT_COUNT;

  return minCount + Math.floor(Math.random() * (maxFeasible - minCount + 1));
}

// Son turlara göre tur tipini seçer (son 5 turda her iki tip garantili)
export function pickRoundType(recentTypes: PrimusRoundType[]): PrimusRoundType {
  const window = recentTypes.slice(-PRIMUS_ROUND_TYPE_WINDOW);

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

// Kare/küp hedefini üslü gösterimle formatlar
export function formatSquareCubeTarget(value: number): string {
  const cubeRoot = Math.round(Math.pow(value, 1 / 3));

  if (cubeRoot ** 3 === value) {
    return `${cubeRoot}³ = ${value}`;
  }

  const squareRoot = Math.sqrt(value);
  return `${squareRoot}² = ${value}`;
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
      : sortedValues.map(formatSquareCubeTarget);

  return `Hedefler: ${formattedValues.join(", ")}`;
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

// Sayıya en yakın tam kare veya tam küpü döner (mutlak fark en küçük)
export function nearestSquareCube(value: number): NearestSquareCube {
  const candidates: NearestSquareCube[] = [];

  for (let root = 2; root <= 10; root += 1) {
    candidates.push({ root, power: 2, result: root ** 2 });
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

// Asal turu yanlış seçim metnini formatlar
function formatPrimeWrongSelection(value: number): string {
  const smallestFactor = getSmallestPrimeFactor(value);
  const otherFactor = value / smallestFactor;

  return `${value} → ${smallestFactor} × ${otherFactor} = ${value}`;
}

// Yanlış seçim metnini tur tipine göre formatlar
export function formatWrongSelection(
  value: number,
  roundType: PrimusRoundType,
): string {
  if (roundType === "asal") {
    return formatPrimeWrongSelection(value);
  }

  const nearest = nearestSquareCube(value);
  const powerSymbol = nearest.power === 3 ? "³" : "²";

  return `${value} → ${nearest.root}${powerSymbol} = ${nearest.result}`;
}

// Kaçırılan hedef metnini tur tipine göre formatlar
export function formatMissedTarget(
  value: number,
  roundType: PrimusRoundType,
): string {
  if (roundType === "asal") {
    return `${value} — asal sayı`;
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

// Asal turu tahtası üretir
function generatePrimeBoard(config?: GenerateBoardConfig): PrimusBoard {
  const cellCount = config?.cellCount ?? PRIMUS_CELL_COUNT;
  const targetCount = config?.targetCount ?? PRIMUS_TARGET_COUNT;
  const oneDigitCount = pickOneDigitCount();
  const twoDigitCount = cellCount - oneDigitCount;
  const oneDigitCompositesPool = generateOneDigitComposites();

  const minOneDigitPrimes = Math.max(
    0,
    oneDigitCount - oneDigitCompositesPool.length,
    targetCount - twoDigitCount,
  );
  const maxOneDigitPrimes = Math.min(
    targetCount,
    oneDigitCount,
    generateOneDigitPrimes().length,
  );
  const oneDigitPrimeCount =
    minOneDigitPrimes +
    Math.floor(Math.random() * (maxOneDigitPrimes - minOneDigitPrimes + 1));
  const twoDigitPrimeCount = targetCount - oneDigitPrimeCount;

  const selectedOneDigitPrimes = pickRandomItems(
    generateOneDigitPrimes(),
    oneDigitPrimeCount,
  );
  const selectedTwoDigitPrimes = pickRandomItems(
    generateTwoDigitPrimes(),
    twoDigitPrimeCount,
  );
  const selectedTargets = [...selectedOneDigitPrimes, ...selectedTwoDigitPrimes];

  const oneDigitCompositeCount = oneDigitCount - oneDigitPrimeCount;
  const selectedOneDigitComposites = pickRandomItems(
    oneDigitCompositesPool,
    oneDigitCompositeCount,
  );

  const twoDigitCompositeCount = twoDigitCount - twoDigitPrimeCount;
  const selectedTwoDigitComposites = pickRandomItems(
    generateTwoDigitComposites(selectedTwoDigitPrimes),
    twoDigitCompositeCount,
  );

  const values = shuffleArray([
    ...selectedTargets,
    ...selectedOneDigitComposites,
    ...selectedTwoDigitComposites,
  ]);
  const targetIndices = values
    .map((value, index) => (isPrime(value) ? index : -1))
    .filter((index) => index >= 0);

  return { values, targetIndices, roundType: "asal" };
}

// Kare/küp turu tahtası üretir
function generateSquareCubeBoard(config?: GenerateBoardConfig): PrimusBoard {
  const cellCount = config?.cellCount ?? PRIMUS_CELL_COUNT;
  const targetCount = config?.targetCount ?? PRIMUS_TARGET_COUNT;
  const oneDigitCount = pickOneDigitCount();
  const twoDigitCount = cellCount - oneDigitCount;

  const oneDigitTargetsPool = getSquareOrCubeNumbers(
    PRIMUS_ONE_DIGIT_MIN,
    PRIMUS_ONE_DIGIT_MAX,
  );
  const twoDigitTargetsPool = getSquareOrCubeNumbers(
    PRIMUS_TWO_DIGIT_MIN,
    PRIMUS_TWO_DIGIT_MAX,
  );
  const oneDigitFillersPool = getNonSquareCubeNumbers(
    PRIMUS_ONE_DIGIT_MIN,
    PRIMUS_ONE_DIGIT_MAX,
  );

  const minOneDigitTargets = Math.max(
    0,
    oneDigitCount - oneDigitFillersPool.length,
    targetCount - twoDigitTargetsPool.length,
  );
  const maxOneDigitTargets = Math.min(
    targetCount,
    oneDigitCount,
    oneDigitTargetsPool.length,
  );
  const oneDigitTargetCount =
    minOneDigitTargets +
    Math.floor(Math.random() * (maxOneDigitTargets - minOneDigitTargets + 1));
  const twoDigitTargetCount = targetCount - oneDigitTargetCount;

  const selectedOneDigitTargets = pickRandomItems(
    oneDigitTargetsPool,
    oneDigitTargetCount,
  );
  const selectedTwoDigitTargets = pickRandomItems(
    twoDigitTargetsPool,
    twoDigitTargetCount,
  );
  const selectedTargets = [...selectedOneDigitTargets, ...selectedTwoDigitTargets];

  const oneDigitFillerCount = oneDigitCount - oneDigitTargetCount;
  const selectedOneDigitFillers = pickRandomItems(
    oneDigitFillersPool.filter((value) => !selectedTargets.includes(value)),
    oneDigitFillerCount,
  );

  const twoDigitFillerCount = twoDigitCount - twoDigitTargetCount;
  const selectedTwoDigitFillers = pickRandomItems(
    getNonSquareCubeNumbers(
      PRIMUS_TWO_DIGIT_MIN,
      PRIMUS_TWO_DIGIT_MAX,
      selectedTargets,
    ),
    twoDigitFillerCount,
  );

  const values = shuffleArray([
    ...selectedTargets,
    ...selectedOneDigitFillers,
    ...selectedTwoDigitFillers,
  ]);
  const targetIndices = values
    .map((value, index) => (isSquareOrCube(value) ? index : -1))
    .filter((index) => index >= 0);

  return { values, targetIndices, roundType: "kareKup" };
}

// Tur tipine göre Primus tahtası üretir
export function generateBoard(
  roundType: PrimusRoundType,
  config?: GenerateBoardConfig,
): PrimusBoard {
  if (roundType === "kareKup") {
    return generateSquareCubeBoard(config);
  }

  return generatePrimeBoard(config);
}

// Briefing / görev metnini tur tipine göre döner
export function getRoundTaskLabel(roundType: PrimusRoundType): string {
  return roundType === "asal"
    ? "Asal sayıları bul"
    : "Kare ve küpleri bul";
}

// Briefing fazı kısa örnek metnini tur tipine göre döner
export function getBriefingExample(roundType: PrimusRoundType): string {
  return roundType === "asal" ? "2, 3, 11" : "2² = 4, 3³ = 27";
}
