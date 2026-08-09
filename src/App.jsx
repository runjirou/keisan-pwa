import { useState, useEffect } from "react";
import { COLORS, FONT_BODY, QUESTIONS_PER_SHEET, MAX_USER_NAME_LENGTH } from "./constants";
import { loadSheets, saveSheets, loadSettings, saveSettings, loadUsers, saveUsers } from "./storage";
import MenuScreen from "./components/MenuScreen";
import QuizScreen from "./components/QuizScreen";
import UserSetupScreen from "./components/UserSetupScreen";

export default function KeisanApp() {
  const [screen, setScreen] = useState("menu"); // 'menu' | 'quiz'
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [activeLevel, setActiveLevel] = useState(1);
  const [sheets, setSheets] = useState(() => loadSheets()); // [{level, score, seconds, date, total, user}]
  const [showTimer, setShowTimer] = useState(() => {
    const settings = loadSettings();
    return typeof settings.showTimer === "boolean" ? settings.showTimer : true;
  });
  // デバッグ用：1枚あたりの出題数（スライダーで変更可能）
  const [questionsPerSheet, setQuestionsPerSheet] = useState(() => {
    const settings = loadSettings();
    return typeof settings.questionsPerSheet === "number" ? settings.questionsPerSheet : QUESTIONS_PER_SHEET;
  });
  const [activeQuestionsPerSheet, setActiveQuestionsPerSheet] = useState(QUESTIONS_PER_SHEET);

  const [users, setUsers] = useState(() => loadUsers()); // string[]
  const [currentUser, setCurrentUser] = useState(() => {
    const loadedUsers = loadUsers();
    const settings = loadSettings();
    if (typeof settings.currentUser === "string" && loadedUsers.includes(settings.currentUser)) {
      return settings.currentUser;
    }
    return loadedUsers[0] ?? null;
  });

  useEffect(() => {
    saveSheets(sheets);
  }, [sheets]);

  useEffect(() => {
    saveSettings({ showTimer, questionsPerSheet, currentUser });
  }, [showTimer, questionsPerSheet, currentUser]);

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  const handleStart = (level) => {
    setActiveLevel(level);
    setActiveQuestionsPerSheet(questionsPerSheet);
    setScreen("quiz");
  };

  const handleRecord = (entry) => {
    setSheets((prev) => [...prev, entry]);
  };

  const handleBack = () => {
    setScreen("menu");
  };

  const handleReset = () => {
    setSheets((prev) => prev.filter((s) => s.user !== currentUser));
  };

  const handleCreateUser = (rawName) => {
    const trimmed = rawName.trim();
    if (!trimmed) return { ok: false, error: "なまえを にゅうりょくしてね" };
    if (trimmed.length > MAX_USER_NAME_LENGTH) {
      return { ok: false, error: `${MAX_USER_NAME_LENGTH}もじ いないで にゅうりょくしてね` };
    }
    if (users.includes(trimmed)) return { ok: false, error: "そのなまえは もう あるよ" };

    if (users.length === 0) {
      // ユーザー機能を導入する前の記録は、最初に作られたユーザーに引き継ぐ
      setSheets((prev) => prev.map((s) => (s.user ? s : { ...s, user: trimmed })));
    }
    setUsers((prev) => [...prev, trimmed]);
    setCurrentUser(trimmed);
    return { ok: true };
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

      {users.length === 0 && <UserSetupScreen onCreateUser={handleCreateUser} />}
      {users.length > 0 && screen === "menu" && (
        <MenuScreen
          sheets={sheets}
          selectedLevel={selectedLevel}
          onSelectLevel={setSelectedLevel}
          onStart={handleStart}
          showTimer={showTimer}
          onToggleTimer={setShowTimer}
          onReset={handleReset}
          questionsPerSheet={questionsPerSheet}
          onChangeQuestionsPerSheet={setQuestionsPerSheet}
          users={users}
          currentUser={currentUser}
          onSwitchUser={setCurrentUser}
          onCreateUser={handleCreateUser}
        />
      )}
      {users.length > 0 && screen === "quiz" && (
        <QuizScreen
          level={activeLevel}
          showTimer={showTimer}
          sheets={sheets}
          onRecord={handleRecord}
          onBack={handleBack}
          questionsPerSheet={activeQuestionsPerSheet}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
