import {
  PRIMUS_CELL_COUNT,
  PRIMUS_MAX_ONE_DIGIT_COUNT,
  PRIMUS_MIN_ONE_DIGIT_COUNT,
  PRIMUS_ONE_DIGIT_MAX,
  PRIMUS_ONE_DIGIT_MIN,
  PRIMUS_PRIME_COUNT,
  PRIMUS_TWO_DIGIT_MAX,
  PRIMUS_TWO_DIGIT_MIN,
} from "../constants";

export interface PrimusBoard {
  values: number[];
  primeIndices: number[];
}

export interface GenerateBoardConfig {
  cellCount?: number;
  primeCount?: number;
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
    PRIMUS_PRIME_COUNT + oneDigitComposites,
  );
  const minCount = PRIMUS_MIN_ONE_DIGIT_COUNT;

  return minCount + Math.floor(Math.random() * (maxFeasible - minCount + 1));
}

// Primus tahtası için benzersiz 1+2 basamaklı sayılar ve sabit asal üretir
export function generateBoard(config?: GenerateBoardConfig): PrimusBoard {
  const cellCount = config?.cellCount ?? PRIMUS_CELL_COUNT;
  const primeCount = config?.primeCount ?? PRIMUS_PRIME_COUNT;
  const oneDigitCount = pickOneDigitCount();
  const twoDigitCount = cellCount - oneDigitCount;
  const oneDigitCompositesPool = generateOneDigitComposites();

  const minOneDigitPrimes = Math.max(
    0,
    oneDigitCount - oneDigitCompositesPool.length,
    primeCount - twoDigitCount,
  );
  const maxOneDigitPrimes = Math.min(
    primeCount,
    oneDigitCount,
    generateOneDigitPrimes().length,
  );
  const oneDigitPrimeCount =
    minOneDigitPrimes +
    Math.floor(Math.random() * (maxOneDigitPrimes - minOneDigitPrimes + 1));
  const twoDigitPrimeCount = primeCount - oneDigitPrimeCount;

  const selectedOneDigitPrimes = pickRandomItems(
    generateOneDigitPrimes(),
    oneDigitPrimeCount,
  );
  const selectedTwoDigitPrimes = pickRandomItems(
    generateTwoDigitPrimes(),
    twoDigitPrimeCount,
  );
  const selectedPrimes = [...selectedOneDigitPrimes, ...selectedTwoDigitPrimes];

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
    ...selectedPrimes,
    ...selectedOneDigitComposites,
    ...selectedTwoDigitComposites,
  ]);
  const primeIndices = values
    .map((value, index) => (isPrime(value) ? index : -1))
    .filter((index) => index >= 0);

  return { values, primeIndices };
}
