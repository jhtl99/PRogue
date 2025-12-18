import { useState } from "react";
import LandingPage from "./pages/StartPage";
import UpgradesPage from "./pages/UpgradesPage";
import PokerPage from "./pages/PokerPage";

type Screen = "landing" | "upgrades" | "poker";

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [wisdom] = useState(0);

  if (screen === "landing") {
    return <LandingPage onBegin={() => setScreen("upgrades")} />;
  }

  if (screen === "upgrades") {
    return <UpgradesPage wisdom={wisdom} onStartRun={() => setScreen("poker")} />;
  }

  return <PokerPage />;
}
