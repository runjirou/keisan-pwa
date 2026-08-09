import { useState, useCallback, useEffect, useRef } from "react";
import { Check, X, Delete, Clock, Calendar } from "lucide-react";
import { COLORS, FONT_DISPLAY, LEVELS } from "../constants";
import { generateProblem, scoreMeta, timeMeta, todayStr } from "../gameLogic";
import { pressHandlers } from "../pressHandlers";

export default function QuizScreen({ level, showTimer, sheets, onRecord, onBack, questionsPerSheet, currentUser }) {
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

    const isLast = index + 1 >= questionsPerSheet;

    setTimeout(() => {
      if (isLast) {
        const seconds = Math.round((Date.now() - startTimeRef.current) / 1000);
        const date = todayStr();
        const countBefore = sheets.filter((s) => s.level === level && s.date === date && s.user === currentUser).length;
        setFinalSeconds(seconds);
        setTodayCount(countBefore + 1);
        onRecord({ level, score: nextCorrectCount, seconds, date, total: questionsPerSheet, user: currentUser });
        setDone(true);
      } else {
        setIndex((i) => i + 1);
        setProblem(generateProblem(level));
        setBuffer("");
        setFeedback(null);
        setLocked(false);
      }
    }, isCorrect ? 500 : 900);
  }, [locked, buffer, problem, index, level, correctCount, sheets, onRecord, questionsPerSheet, currentUser]);

  const cardBorderColor =
    feedback === "correct" ? COLORS.green : feedback === "wrong" ? COLORS.coral : COLORS.cardBorderDefault;

  if (done) {
    const { bg, fg, label } = scoreMeta(correctCount, questionsPerSheet);
    const { label: timeLabel } = timeMeta(finalSeconds, level);

    const statRowStyle = {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 12,
      borderRadius: 16,
      padding: "14px 18px",
      backgroundColor: "rgba(255,255,255,0.4)",
    };
    const statTextStyle = {
      fontFamily: FONT_DISPLAY,
      fontSize: 18,
      fontWeight: 700,
      color: fg,
    };

    return (
      <div
        style={{
          minHeight: "100dvh",
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
            padding: "40px 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            backgroundColor: bg,
            boxShadow: "0 8px 0 rgba(0,0,0,0.08)",
            boxSizing: "border-box",
          }}
        >
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, opacity: 0.75, color: fg }}>
            {levelMeta.label} ・ プリント かんりょう！
          </span>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            <div style={statRowStyle}>
              <Check size={22} strokeWidth={3} color={fg} />
              <span style={statTextStyle}>
                せいかい {correctCount}/{questionsPerSheet}もん ・ {label}
              </span>
            </div>
            <div style={statRowStyle}>
              <Clock size={22} color={fg} />
              <span style={statTextStyle}>
                {finalSeconds}びょう ・ {timeLabel}
              </span>
            </div>
            <div style={statRowStyle}>
              <Calendar size={22} color={fg} />
              <span style={statTextStyle}>
                きょう {displayCount}まいめ
              </span>
            </div>
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
        height: "100dvh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 24px 32px",
        boxSizing: "border-box",
        overflowY: "auto",
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
            もんだい {index + 1} / {questionsPerSheet}
          </span>
        </div>
        <div style={{ width: "100%", height: 10, borderRadius: 999, backgroundColor: COLORS.paperLine, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              borderRadius: 999,
              backgroundColor: COLORS.teal,
              transition: "width 0.3s",
              width: `${((index + (feedback ? 1 : 0)) / questionsPerSheet) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* フラッシュカード */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 380,
            maxHeight: "100%",
            aspectRatio: "4 / 3",
            backgroundColor: COLORS.cardBg,
            borderRadius: 28,
            border: `6px solid ${cardBorderColor}`,
            boxShadow: "0 8px 0 rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "border-color 0.2s",
            boxSizing: "border-box",
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
