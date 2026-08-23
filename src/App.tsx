import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Onboarding, ONBOARDING_SEEN_KEY } from "./components/Onboarding";
import { getCurrentUser } from "./lib/auth";
import { endSession, initUser, startSession } from "./lib/analytics";
import { Home } from "./pages/Home";
import { Landing, AUTH_SHOWN_KEY } from "./pages/Landing";
import { MnemoGame } from "./pages/MnemoGame";
import { PrimusGame } from "./pages/PrimusGame";

// Uygulama kabuğu: auth, oturum takibi ve routing
function App() {
  const [showLanding, setShowLanding] = useState(
    () => localStorage.getItem(AUTH_SHOWN_KEY) !== "true",
  );
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleEnterGame = (): void => {
    localStorage.setItem(AUTH_SHOWN_KEY, "true");
    setShowLanding(false);
  };

  useEffect(() => {
    if (localStorage.getItem(AUTH_SHOWN_KEY) === "true") {
      return;
    }

    // Magic link dönüşünde oturum varsa landing'i atla
    void getCurrentUser().then((user) => {
      if (!user) {
        return;
      }

      localStorage.setItem(AUTH_SHOWN_KEY, "true");
      setShowLanding(false);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    void initUser().then((userId) => {
      if (cancelled || !userId) {
        return;
      }

      void startSession(userId);
    });

    const handleBeforeUnload = (): void => {
      void endSession();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      cancelled = true;
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (showLanding) {
      return;
    }

    if (localStorage.getItem(ONBOARDING_SEEN_KEY) !== "true") {
      setShowOnboarding(true);
    }
  }, [showLanding]);

  if (showLanding) {
    return (
      <Landing onEnterGame={handleEnterGame} onAuthenticated={() => undefined} />
    );
  }

  return (
    <BrowserRouter>
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mnemo" element={<MnemoGame />} />
        <Route path="/primus" element={<PrimusGame />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
