import React, { useState, useCallback, useEffect, useRef } from "react";
import { Check, X, Play, Delete, Clock } from "lucide-react";

// ブラウザのlocalStorageを使った永続化ラッパー
// (Claude.aiのアーティファクト専用APIの代わりに、実際のブラウザではlocalStorageを使用)
const storage = {
  async get(key) {
    const value = window.localStorage.getItem(key);
    if (value === null) throw new Error(`key not found: ${key}`);
    return { key, value };
  },
  async set(key, value) {
    window.localStorage.setItem(key, value);
    return { key, value };
  },
};

// ---------- 色・定数 ----------
const COLORS = {
  paper: "#FFFDF7",
  paperLine: "#F0E9D8",
  ink: "#2C3E50",
  inkSoft: "#9B9382",
  inkFaint: "#B8AF98",
  yellow: "#FFD23F",
  teal: "#4ECDC4",
  tealDark: "#2FA39B",
  green: "#06D6A0",
  coral: "#EF476F",
  cardBorderDefault: "#FFD23F",
  cardBg: "#FFFFFF",
  keyBorder: "#EFE7D3",
  navy: "#2C3E50",
  navyDark: "#1A2530",
  levelSelBg: "#FFF6DD",
  blue: "#3B82F6",
};

const FONT_DISPLAY = "'Fredoka', 'Nunito', sans-serif";
const FONT_BODY = "'Nunito', 'Hiragino Maru Gothic ProN', sans-serif";

const QUESTIONS_PER_SHEET = 20;

const LEVELS = [
  { id: 1, label: "レベル1", sub: "たしざん（くりあがりなし）" },
  { id: 2, label: "レベル2", sub: "たしざん（くりあがり中心）" },
];

// レベル別のタイム基準（秒）：この秒数以内なら「超すごい！」
const TIME_THRESHOLDS = { 1: 20, 2: 30 };

function todayStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ---- 問題生成 ----
function genNoCarry() {
  const a = Math.floor(Math.random() * 9) + 1; // 1-9
  const maxB = 9 - a;
  if (maxB < 1) return genNoCarry();
  const b = Math.floor(Math.random() * maxB) + 1;
  return { a, b, answer: a + b };
}

function genCarry() {
  const a = Math.floor(Math.random() * 9) + 1; // 1-9
  const b = Math.floor(Math.random() * 9) + 1; // 1-9
  if (a + b < 10) return genCarry();
  return { a, b, answer: a + b };
}

function generateProblem(level) {
  if (level === 1) return genNoCarry();
  // レベル2: 8割 繰り上がりあり／2割 繰り上がりなし
  return Math.random() < 0.8 ? genCarry() : genNoCarry();
}

function scoreMeta(score) {
  const pct = Math.round((score / QUESTIONS_PER_SHEET) * 100);
  if (pct >= 100) return { bg: COLORS.blue, fg: "#FFFFFF", label: "超すごい！" };
  if (pct >= 80) return { bg: COLORS.green, fg: "#FFFFFF", label: "すごい！" };
  if (pct >= 50) return { bg: COLORS.green, fg: "#FFFFFF", label: "やったね！" };
  return { bg: COLORS.paperLine, fg: COLORS.inkSoft, label: "がんばれ！" };
}

function timeMeta(seconds, level) {
  const threshold = TIME_THRESHOLDS[level];
  if (seconds <= threshold) return { bg: COLORS.blue, label: "超すごい！" };
  return { bg: COLORS.green, label: "すごい！" };
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 46,
        height: 26,
        borderRadius: 999,
        border: "none",
        backgroundColor: checked ? COLORS.teal : COLORS.keyBorder,
        position: "relative",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 23 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: "#FFFFFF",
          transition: "left 0.15s",
          boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
        }}
      />
    </button>
  );
}

function pressHandlers(colorShadow) {
  return {
    onMouseDown: (e) => {
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.transform = "translateY(4px)";
    },
    onMouseUp: (e) => {
      e.currentTarget.style.boxShadow = colorShadow;
      e.currentTarget.style.transform = "translateY(0)";
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.boxShadow = colorShadow;
      e.currentTarget.style.transform = "translateY(0)";
    },
    onTouchStart: (e) => {
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.transform = "translateY(4px)";
    },
    onTouchEnd: (e) => {
      e.currentTarget.style.boxShadow = colorShadow;
      e.currentTarget.style.transform = "translateY(0)";
    },
  };
}

// ---------- メニュー画面 ----------
function MenuScreen({ sheets, selectedLevel, onSelectLevel, onStart, showTimer, onToggleTimer, onReset }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 24px 32px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 30,
            fontWeight: 700,
            color: COLORS.ink,
            margin: 0,
            letterSpacing: 0.3,
          }}
        >
          けいさんプリント
        </h1>
        <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.inkSoft, marginTop: 6, marginBottom: 0 }}>
          れんしゅうするレベルをえらんでね
        </p>

        {/* きょうの枚数（レベル別） */}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {LEVELS.map((lv) => {
            const count = sheets.filter((s) => s.level === lv.id && s.date === todayStr()).length;
            return (
              <div
                key={lv.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: COLORS.levelSelBg,
                  borderRadius: 999,
                  padding: "4px 10px",
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.inkSoft }}>
                  きょうの{lv.label}
                </span>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, color: COLORS.ink }}>
                  {count}まい
                </span>
              </div>
            );
          })}
        </div>

        {/* レベル選択 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
          {LEVELS.map((lv) => {
            const active = selectedLevel === lv.id;
            return (
              <button
                key={lv.id}
                onClick={() => onSelectLevel(lv.id)}
                style={{
                  fontFamily: FONT_DISPLAY,
                  borderRadius: 18,
                  border: `3px solid ${active ? COLORS.teal : COLORS.keyBorder}`,
                  backgroundColor: active ? COLORS.levelSelBg : "#FFFFFF",
                  padding: "14px 10px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.ink }}>{lv.label}</div>
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 11,
                    fontWeight: 700,
                    color: COLORS.inkSoft,
                    marginTop: 4,
                    lineHeight: 1.3,
                  }}
                >
                  {lv.sub}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onStart(selectedLevel)}
          style={{
            fontFamily: FONT_DISPLAY,
            marginTop: 18,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 20,
            border: "none",
            background: COLORS.teal,
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: 700,
            padding: "20px 0",
            boxShadow: `0 5px 0 ${COLORS.tealDark}`,
            cursor: "pointer",
          }}
          {...pressHandlers(`0 5px 0 ${COLORS.tealDark}`)}
        >
          <Play size={22} fill="#FFFFFF" />
          プリントをはじめる（20もん）
        </button>

        {/* せってい */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 16,
            border: `2px solid ${COLORS.keyBorder}`,
            padding: "12px 16px",
          }}
        >
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: COLORS.ink }}>
              タイマーを表示
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.inkFaint, marginTop: 2 }}>
              出題中に左上へ経過時間を表示します
            </div>
          </div>
          <ToggleSwitch checked={showTimer} onChange={onToggleTimer} />
        </div>

        <button
          onClick={() => {
            if (window.confirm("いままでのきろくをぜんぶ けしますか？")) {
              onReset();
            }
          }}
          style={{
            marginTop: 10,
            background: "none",
            border: "none",
            fontSize: 12,
            fontWeight: 700,
            color: COLORS.inkFaint,
            textDecoration: "underline",
            cursor: "pointer",
            padding: 4,
          }}
        >
          きろくをリセットする
        </button>


        {/* レベル別 結果一覧 */}
        <div style={{ width: "100%", marginTop: 40, display: "flex", flexDirection: "column", gap: 32 }}>
          {LEVELS.map((lv) => {
            const lvSheets = sheets.filter((s) => s.level === lv.id);
            return (
              <div key={lv.id}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: COLORS.ink }}>
                    {lv.label}のプリント
                  </span>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: COLORS.ink }}>
                    {lvSheets.length}
                    <span style={{ fontSize: 12, color: COLORS.inkFaint, fontWeight: 700 }}>まい</span>
                  </span>
                </div>

                {lvSheets.length === 0 ? (
                  <div
                    style={{
                      borderRadius: 16,
                      border: `2px dashed ${COLORS.keyBorder}`,
                      padding: "24px 0",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.inkFaint, margin: 0 }}>
                      まだプリントがありません
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                    {lvSheets.map((sheet, i) => {
                      const { bg, fg } = scoreMeta(sheet.score);
                      return (
                        <div
                          key={i}
                          style={{
                            position: "relative",
                            aspectRatio: "3 / 4",
                            borderRadius: 10,
                            backgroundColor: bg,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 0 rgba(0,0,0,0.08)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              right: 0,
                              width: 0,
                              height: 0,
                              borderStyle: "solid",
                              borderWidth: "0 10px 10px 0",
                              borderColor: "transparent rgba(0,0,0,0.12) transparent transparent",
                            }}
                          />
                          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 10, fontWeight: 700, opacity: 0.7, color: fg }}>
                            No.{i + 1}
                          </span>
                          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: fg }}>
                            {sheet.score}/{QUESTIONS_PER_SHEET}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- 出題画面 ----------
function QuizScreen({ level, showTimer, sheets, onRecord, onBack }) {
  const [index, setIndex] = useState(0); // 0-19
  const [problem, setProblem] = useState(() => generateProblem(level));
  const [buffer, setBuffer] = useState("");
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [locked, setLocked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [finalSeconds, setFinalSeconds] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);

  const startTimeRef = useRef(Date.now());
  const [liveSeconds, setLiveSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, []);

  // 結果画面になったら「きょう解いた枚数」をカウントアップ表示
  useEffect(() => {
    if (!done || todayCount <= 0) return;
    setDisplayCount(0);
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setDisplayCount(current);
      if (current >= todayCount) clearInterval(id);
    }, 120);
    return () => clearInterval(id);
  }, [done, todayCount]);

  const levelMeta = LEVELS.find((l) => l.id === level);

  const pushDigit = (d) => {
    if (locked) return;
    if (buffer.length >= 2) return; // 答えは最大2桁
    setBuffer((b) => b + String(d));
  };

  const backspace = () => {
    if (locked) return;
    setBuffer((b) => b.slice(0, -1));
  };

  const submit = useCallback(() => {
    if (locked || buffer === "") return;
    setLocked(true);
    const isCorrect = Number(buffer) === problem.answer;
    const nextCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    if (isCorrect) setCorrectCount(nextCorrectCount);
    setFeedback(isCorrect ? "correct" : "wrong");

    const isLast = index + 1 >= QUESTIONS_PER_SHEET;

    setTimeout(() => {
      if (isLast) {
        const seconds = Math.round((Date.now() - startTimeRef.current) / 1000);
        const date = todayStr();
        const countBefore = sheets.filter((s) => s.level === level && s.date === date).length;
        setFinalSeconds(seconds);
        setTodayCount(countBefore + 1);
        onRecord({ level, score: nextCorrectCount, seconds, date });
        setDone(true);
      } else {
        setIndex((i) => i + 1);
        setProblem(generateProblem(level));
        setBuffer("");
        setFeedback(null);
        setLocked(false);
      }
    }, isCorrect ? 500 : 900);
  }, [locked, buffer, problem, index, level, correctCount, sheets, onRecord]);

  const cardBorderColor =
    feedback === "correct" ? COLORS.green : feedback === "wrong" ? COLORS.coral : COLORS.cardBorderDefault;

  if (done) {
    const { bg, fg, label } = scoreMeta(correctCount);
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 380,
            borderRadius: 28,
            padding: "48px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            backgroundColor: bg,
            boxShadow: "0 8px 0 rgba(0,0,0,0.08)",
          }}
        >
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, opacity: 0.75, color: fg }}>
            {levelMeta.label} ・ プリント かんりょう！
          </span>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 60, fontWeight: 700, color: fg }}>
            {correctCount}
            <span style={{ fontSize: 30, opacity: 0.7 }}>/{QUESTIONS_PER_SHEET}</span>
          </span>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700, marginTop: 4, color: fg }}>
            {label}
          </span>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderRadius: 999,
              padding: "8px 18px",
              backgroundColor: timeMeta(finalSeconds, level).bg,
            }}
          >
            <Clock size={16} color="#FFFFFF" />
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>
              {finalSeconds}びょう ・ {timeMeta(finalSeconds, level).label}
            </span>
          </div>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              color: fg,
            }}
          >
            <span style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 800, opacity: 0.8 }}>
              きょう {levelMeta.label} は
            </span>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700 }}>
              {displayCount}
            </span>
            <span style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 800, opacity: 0.8 }}>
              まいめ！
            </span>
          </div>
        </div>
        <button
          onClick={onBack}
          style={{
            fontFamily: FONT_DISPLAY,
            marginTop: 32,
            width: "100%",
            maxWidth: 380,
            borderRadius: 16,
            border: "none",
            background: COLORS.navy,
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: 700,
            padding: "16px 0",
            boxShadow: `0 4px 0 ${COLORS.navyDark}`,
            cursor: "pointer",
          }}
          {...pressHandlers(`0 4px 0 ${COLORS.navyDark}`)}
        >
          メニューへ もどる
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 24px 32px",
        boxSizing: "border-box",
      }}
    >
      {/* 経過タイマー（左上） */}
      {showTimer && (
        <div
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 5,
            borderRadius: 999,
            padding: "6px 12px",
            backgroundColor: COLORS.cardBg,
            border: `2px solid ${COLORS.keyBorder}`,
            boxShadow: "0 2px 0 rgba(0,0,0,0.06)",
          }}
        >
          <Clock size={14} color={COLORS.inkSoft} />
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, color: COLORS.inkSoft }}>
            {liveSeconds}びょう
          </span>
        </div>
      )}

      {/* 進捗バー */}
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: COLORS.inkSoft }}>
            {levelMeta.label}
          </span>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: COLORS.inkSoft }}>
            もんだい {index + 1} / {QUESTIONS_PER_SHEET}
          </span>
        </div>
        <div style={{ width: "100%", height: 10, borderRadius: 999, backgroundColor: COLORS.paperLine, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              borderRadius: 999,
              backgroundColor: COLORS.teal,
              transition: "width 0.3s",
              width: `${((index + (feedback ? 1 : 0)) / QUESTIONS_PER_SHEET) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* フラッシュカード */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 380,
            aspectRatio: "4 / 3",
            backgroundColor: COLORS.cardBg,
            borderRadius: 28,
            border: `6px solid ${cardBorderColor}`,
            boxShadow: "0 8px 0 rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "border-color 0.2s",
          }}
        >
          <div style={{ position: "absolute", top: 16, left: 16, width: 12, height: 12, borderRadius: "50%", backgroundColor: COLORS.paperLine }} />
          <div style={{ position: "absolute", top: 16, right: 16, width: 12, height: 12, borderRadius: "50%", backgroundColor: COLORS.paperLine }} />

          {feedback === null && (
            <div style={{ fontFamily: FONT_DISPLAY, display: "flex", alignItems: "center", gap: 14, color: COLORS.ink }}>
              <span style={{ fontSize: 62, fontWeight: 700 }}>{problem.a}</span>
              <span style={{ fontSize: 50, fontWeight: 500, color: COLORS.inkFaint }}>+</span>
              <span style={{ fontSize: 62, fontWeight: 700 }}>{problem.b}</span>
              <span style={{ fontSize: 50, fontWeight: 500, color: COLORS.inkFaint }}>=</span>
              <span
                style={{
                  fontSize: 62,
                  fontWeight: 700,
                  color: buffer ? COLORS.ink : COLORS.yellow,
                  minWidth: 70,
                  textAlign: "center",
                  borderBottom: `4px solid ${COLORS.yellow}`,
                }}
              >
                {buffer || "?"}
              </span>
            </div>
          )}

          {feedback === "correct" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, animation: "pop 0.3s ease-out" }}>
              <Check size={72} strokeWidth={3} color={COLORS.green} />
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, color: COLORS.green }}>せいかい！</span>
            </div>
          )}

          {feedback === "wrong" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <X size={64} strokeWidth={3} color={COLORS.coral} />
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: COLORS.coral }}>
                こたえは {problem.answer}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 数字パッド */}
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => pushDigit(n)}
              disabled={locked}
              style={{
                fontFamily: FONT_DISPLAY,
                aspectRatio: "2 / 1",
                borderRadius: 16,
                backgroundColor: "#FFFFFF",
                border: `2px solid ${COLORS.keyBorder}`,
                boxShadow: `0 4px 0 ${COLORS.keyBorder}`,
                fontSize: 26,
                fontWeight: 700,
                color: COLORS.ink,
                opacity: locked ? 0.4 : 1,
                cursor: locked ? "default" : "pointer",
              }}
              {...pressHandlers(`0 4px 0 ${COLORS.keyBorder}`)}
            >
              {n}
            </button>
          ))}

          <button
            onClick={backspace}
            disabled={locked}
            style={{
              aspectRatio: "2 / 1",
              borderRadius: 16,
              backgroundColor: "#FFFFFF",
              border: `2px solid ${COLORS.keyBorder}`,
              boxShadow: `0 4px 0 ${COLORS.keyBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: locked ? 0.4 : 1,
              cursor: locked ? "default" : "pointer",
            }}
            {...pressHandlers(`0 4px 0 ${COLORS.keyBorder}`)}
          >
            <Delete size={22} color={COLORS.inkSoft} />
          </button>

          <button
            onClick={() => pushDigit(0)}
            disabled={locked}
            style={{
              fontFamily: FONT_DISPLAY,
              aspectRatio: "2 / 1",
              borderRadius: 16,
              backgroundColor: "#FFFFFF",
              border: `2px solid ${COLORS.keyBorder}`,
              boxShadow: `0 4px 0 ${COLORS.keyBorder}`,
              fontSize: 26,
              fontWeight: 700,
              color: COLORS.ink,
              opacity: locked ? 0.4 : 1,
              cursor: locked ? "default" : "pointer",
            }}
            {...pressHandlers(`0 4px 0 ${COLORS.keyBorder}`)}
          >
            0
          </button>

          <button
            onClick={submit}
            disabled={locked || buffer === ""}
            style={{
              aspectRatio: "2 / 1",
              borderRadius: 16,
              backgroundColor: buffer === "" ? "#FFFFFF" : COLORS.teal,
              border: `2px solid ${buffer === "" ? COLORS.keyBorder : COLORS.tealDark}`,
              boxShadow: `0 4px 0 ${buffer === "" ? COLORS.keyBorder : COLORS.tealDark}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: locked ? 0.4 : 1,
              cursor: locked || buffer === "" ? "default" : "pointer",
            }}
            {...pressHandlers(`0 4px 0 ${buffer === "" ? COLORS.keyBorder : COLORS.tealDark}`)}
          >
            <Check size={26} strokeWidth={3} color={buffer === "" ? COLORS.inkFaint : "#FFFFFF"} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- ルート ----------
const STORAGE_KEY_SHEETS = "keisan:sheets";
const STORAGE_KEY_SETTINGS = "keisan:settings";

export default function KeisanApp() {
  const [screen, setScreen] = useState("menu"); // 'menu' | 'quiz'
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [activeLevel, setActiveLevel] = useState(1);
  const [sheets, setSheets] = useState([]); // [{level, score, seconds, date}]
  const [showTimer, setShowTimer] = useState(true);
  const [loaded, setLoaded] = useState(false);

  // 起動時に保存データを読み込む
  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get(STORAGE_KEY_SHEETS, false);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          if (Array.isArray(parsed)) setSheets(parsed);
        }
      } catch (e) {
        // 保存データがまだ無い場合はそのまま初期状態を使う
      }
      try {
        const res = await storage.get(STORAGE_KEY_SETTINGS, false);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          if (typeof parsed.showTimer === "boolean") setShowTimer(parsed.showTimer);
        }
      } catch (e) {
        // 保存データがまだ無い場合はそのまま初期状態を使う
      }
      setLoaded(true);
    })();
  }, []);

  // sheetsが変わるたびに保存（読み込み完了後のみ）
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await storage.set(STORAGE_KEY_SHEETS, JSON.stringify(sheets), false);
      } catch (e) {
        console.error("プリント記録の保存に失敗しました", e);
      }
    })();
  }, [sheets, loaded]);

  // 設定が変わるたびに保存（読み込み完了後のみ）
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await storage.set(STORAGE_KEY_SETTINGS, JSON.stringify({ showTimer }), false);
      } catch (e) {
        console.error("せっていの保存に失敗しました", e);
      }
    })();
  }, [showTimer, loaded]);

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

  const handleReset = async () => {
    setSheets([]);
    try {
      await storage.set(STORAGE_KEY_SHEETS, JSON.stringify([]), false);
    } catch (e) {
      console.error("きろくのリセットに失敗しました", e);
    }
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

      {!loaded && (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, color: COLORS.inkFaint }}>
            よみこみちゅう…
          </span>
        </div>
      )}

      {loaded && screen === "menu" && (
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
      {loaded && screen === "quiz" && (
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
