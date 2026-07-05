const MS_PER_CELL_REFERENCE = 1000
const ACCURACY_WEIGHT = 0.6
const SPEED_WEIGHT = 0.4
const MAX_SCORE = 100

// Doğruluk ve hıza göre tur puanını 0–100 arasında hesaplar
//
// Örnek değerler:
// 3 kare, 2sn, hepsi doğru → hız=1, final=%100
// 3 kare, 6sn, hepsi doğru → hız=0.5, final=%80
// 3 kare, 15sn, hepsi doğru → hız=0.2, final=%68
// 3 kare, 6sn, 2 doğru → hız=0.5, final=%56
export function calculateScore(
  correctCount: number,
  totalCount: number,
  elapsedMs: number,
): number {
  const accuracy = correctCount / totalCount
  const referenceMs = totalCount * MS_PER_CELL_REFERENCE
  const speed =
    elapsedMs <= referenceMs ? 1 : referenceMs / elapsedMs
  const finalScore =
    (accuracy * ACCURACY_WEIGHT + speed * SPEED_WEIGHT) * MAX_SCORE

  return Math.round(finalScore * 10) / 10
}
