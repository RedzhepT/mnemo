import { useState } from "react";

const HELP_RULES = [
  "Kareleri sırayla hatırla ve işaretle",
  "Emoji modunda kategori bazlı işaretle",
  "Space tuşu → sonraki tur",
  "Hızlı ve doğru ol → yüksek puan",
  "Son 10 turun ortalaması %90 üzerinde → bölüm tamamlandı",
] as const;

// Sağ üst köşede sabit yardım butonu ve kural özeti modalını render eder
export function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        title="Yardım"
        aria-label="Yardım"
        aria-expanded={isOpen}
        className="fixed top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-[#2A2A45] text-sm font-semibold text-[#6B6B8A] transition-colors hover:bg-[#3A3A60] hover:text-[#F0D9B5] active:scale-95"
        onClick={() => setIsOpen((previous) => !previous)}
      >
        ?
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[55] flex items-start justify-center bg-black/50 px-4 pt-16"
          onClick={() => setIsOpen(false)}
        >
          <section
            className="w-full max-w-sm rounded-[6px] border border-mnemo-border bg-mnemo-cell px-5 py-6 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-semibold text-white">Nasıl Oynanır?</h2>
            <ul className="flex flex-col gap-3 text-sm text-mnemo-hud">
              {HELP_RULES.map((rule) => (
                <li key={rule} className="flex gap-2">
                  <span className="text-mnemo-primary-hover" aria-hidden="true">
                    •
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </>
  );
}
