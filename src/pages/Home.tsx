import { Link } from "react-router-dom";

const cardClassName =
  "flex flex-col gap-4 rounded-[6px] border border-mnemo-border bg-mnemo-cell p-6 text-left transition-colors hover:border-mnemo-primary hover:bg-mnemo-cell-hover";

const buttonClassName =
  "rounded-[6px] bg-mnemo-primary px-6 py-3 font-medium text-white transition-colors hover:bg-mnemo-primary-hover active:scale-95";

// Mnemo ve Primus oyun kartlarını gösteren ana sayfa
export function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-mnemo-bg px-4 py-10">
      <div className="flex w-full max-w-3xl flex-col items-center gap-8">
        <header className="text-center">
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Mnemo</h1>
          <p className="mt-2 text-mnemo-hud">
            Hafıza ve odaklanma becerilerini geliştiren oyun platformu
          </p>
        </header>

        <div className="grid w-full gap-4 sm:grid-cols-2">
          <article className={cardClassName}>
            <h2 className="text-xl font-semibold text-white">Mnemo</h2>
            <p className="text-sm text-mnemo-hud">
              Izgara üzerinde sırayla yanan kareleri hatırla ve aynı sırayla
              işaretle. Working memory egzersizi.
            </p>
            <Link to="/mnemo" className={`${buttonClassName} w-fit`}>
              Oyna
            </Link>
          </article>

          <article className={cardClassName}>
            <h2 className="text-xl font-semibold text-white">Primus</h2>
            <p className="text-sm text-mnemo-hud">
              4×4 tahtadaki 2 basamaklı sayılar arasından asal olanları bul.
              Gösterim fazı yok — süre içinde doğru hücreleri işaretle.
            </p>
            <Link to="/primus" className={`${buttonClassName} w-fit`}>
              Oyna
            </Link>
          </article>
        </div>
      </div>
    </div>
  );
}
