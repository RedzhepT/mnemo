import { useState } from "react";

const PRIMUS_HELP_RULES = [
  "Tahtada sayılar durur; sıra önemli değil",
  "Tur tipi değişir: asallar veya kare/küpler",
  "Kare/küp örneği: 2² = 4, 3³ = 27",
  "Doğru hücreleri işaretle; yanlış tıklama turu bitirmez ama puanı düşürür",
  "Aynı hücreye tekrar tıkla → seçimi geri al",
  "Kalan seçim kadar hak; süre bitince veya hak bitince tur biter",
  "Son 10 tur ortalaması %90+ → bölüm tamamlandı",
] as const;

export interface PrimusHelpButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

// HUD satırındaki Primus yardım tetikleyici butonunu render eder
export function PrimusHelpButton({ isOpen, onClick }: PrimusHelpButtonProps) {
  return (
    <button
      type="button"
      title="Yardım"
      aria-label="Yardım"
      aria-expanded={isOpen}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2A2A45] text-sm font-semibold text-[#6B6B8A] transition-colors hover:bg-[#3A3A60] hover:text-[#F0D9B5] active:scale-95"
      onClick={onClick}
    >
      ?
    </button>
  );
}

export interface PrimusHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Primus yardım kural özeti modalını render eder
export function PrimusHelpModal({ isOpen, onClose }: PrimusHelpModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[55] flex items-start justify-center bg-black/50 px-4 pt-20"
      onClick={onClose}
    >
      <section
        className="w-full max-w-sm rounded-[6px] border border-mnemo-border bg-mnemo-cell px-5 py-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-white">Nasıl Oynanır?</h2>
        <ul className="flex flex-col gap-3 text-sm text-mnemo-hud">
          {PRIMUS_HELP_RULES.map((rule) => (
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
  );
}

// Primus yardım butonu ve modal state'ini birlikte yönetir
export function PrimusHelpWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <PrimusHelpButton
        isOpen={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
      />
      <PrimusHelpModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
