import { useState, useEffect } from "react";
import { COLORS, FONT_BODY, QUESTIONS_PER_SHEET, MAX_USER_NAME_LENGTH } from "./constants";
import {
  loadSheets,
  saveSheets,
  loadSettings,
  saveSettings,
  loadUsers,
  saveUsers,
  loadPoints,
  savePoints,
} from "./storage";
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
  const [points, setPoints] = useState(() => loadPoints()); // { [user]: number }
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

  useEffect(() => {
    savePoints(points);
  }, [points]);

  // ポイントを個別管理する前にプリントを済ませていたユーザーへの一度きりの初期計算
  // （プリントが1枚以上あるのにポイント未計算のユーザーだけ、1枚=1ptで補完する）
  useEffect(() => {
    setPoints((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const u of users) {
        if (next[u] !== undefined) continue;
        const sheetCount = sheets.filter((s) => s.user === u).length;
        if (sheetCount >= 1) {
          next[u] = sheetCount;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [users, sheets]);

  const handleStart = (level) => {
    setActiveLevel(level);
    setActiveQuestionsPerSheet(questionsPerSheet);
    setScreen("quiz");
  };

  const handleRecord = (entry) => {
    const todayTotalCount = sheets.filter((s) => s.date === entry.date && s.user === entry.user).length + 1;
    const earned = todayTotalCount >= 5 ? 3 : 1; // 1pt/枚、5枚以上の日はボーナス+2pt
    setSheets((prev) => [...prev, entry]);
    setPoints((prev) => ({ ...prev, [entry.user]: (prev[entry.user] ?? 0) + earned }));
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

  const handleRenameUser = (oldName, rawName) => {
    const trimmed = rawName.trim();
    if (!trimmed) return { ok: false, error: "なまえを にゅうりょくしてね" };
    if (trimmed.length > MAX_USER_NAME_LENGTH) {
      return { ok: false, error: `${MAX_USER_NAME_LENGTH}もじ いないで にゅうりょくしてね` };
    }
    if (trimmed !== oldName && users.includes(trimmed)) {
      return { ok: false, error: "そのなまえは もう あるよ" };
    }
    if (trimmed === oldName) return { ok: true };

    setUsers((prev) => prev.map((u) => (u === oldName ? trimmed : u)));
    setSheets((prev) => prev.map((s) => (s.user === oldName ? { ...s, user: trimmed } : s)));
    if (currentUser === oldName) setCurrentUser(trimmed);
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
          points={points}
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
          onRenameUser={handleRenameUser}
        />
      )}
      {users.length > 0 && screen === "quiz" && (
        <QuizScreen
          level={activeLevel}
          showTimer={showTimer}
          sheets={sheets}
          points={points}
          onRecord={handleRecord}
          onBack={handleBack}
          questionsPerSheet={activeQuestionsPerSheet}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
