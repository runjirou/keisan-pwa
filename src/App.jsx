import { useState, useEffect } from "react";
import { COLORS, FONT_BODY } from "./constants";
import { loadSheets, saveSheets, loadSettings, saveSettings } from "./storage";
import MenuScreen from "./components/MenuScreen";
import QuizScreen from "./components/QuizScreen";

export default function KeisanApp() {
  const [screen, setScreen] = useState("menu"); // 'menu' | 'quiz'
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [activeLevel, setActiveLevel] = useState(1);
  const [sheets, setSheets] = useState(() => loadSheets()); // [{level, score, seconds, date}]
  const [showTimer, setShowTimer] = useState(() => {
    const settings = loadSettings();
    return typeof settings.showTimer === "boolean" ? settings.showTimer : true;
  });

  useEffect(() => {
    saveSheets(sheets);
  }, [sheets]);

  useEffect(() => {
    saveSettings({ showTimer });
  }, [showTimer]);

  const handleStart = (level) => {
    setActiveLevel(level);
    setScreen("quiz");
  };

  const handleRecord = (entry) => {
    setSheets((prev) => [...prev, entry]);
  };

  const handleBack = () => {
    setScreen("menu");
  };

  const handleReset = () => {
    setSheets([]);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: COLORS.paper,
        backgroundImage: `repeating-linear-gradient(0deg, ${COLORS.paper}, ${COLORS.paper} 39px, ${COLORS.paperLine} 40px)`,
        fontFamily: FONT_BODY,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700&family=Nunito:wght@600;800&display=swap');
        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        button { transition: box-shadow 0.1s, transform 0.1s; }
      `}</style>

      {screen === "menu" && (
        <MenuScreen
          sheets={sheets}
          selectedLevel={selectedLevel}
          onSelectLevel={setSelectedLevel}
          onStart={handleStart}
          showTimer={showTimer}
          onToggleTimer={setShowTimer}
          onReset={handleReset}
        />
      )}
      {screen === "quiz" && (
        <QuizScreen
          level={activeLevel}
          showTimer={showTimer}
          sheets={sheets}
          onRecord={handleRecord}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
