import { Play } from "lucide-react";
import { COLORS, FONT_DISPLAY, FONT_BODY, LEVELS, QUESTIONS_PER_SHEET, MIN_QUESTIONS_PER_SHEET } from "../constants";
import { scoreMeta, todayStr } from "../gameLogic";
import { pressHandlers } from "../pressHandlers";
import ToggleSwitch from "./ToggleSwitch";

export default function MenuScreen({
  sheets,
  selectedLevel,
  onSelectLevel,
  onStart,
  showTimer,
  onToggleTimer,
  onReset,
  questionsPerSheet,
  onChangeQuestionsPerSheet,
}) {
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
          プリントをはじめる（{questionsPerSheet}もん）
        </button>

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
                      const total = sheet.total ?? QUESTIONS_PER_SHEET;
                      const { bg, fg } = scoreMeta(sheet.score, total);
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
                            {sheet.score}/{total}
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

        {/* せってい（フッター・小さめ表示） */}
        <div
          style={{
            width: "100%",
            marginTop: 32,
            paddingTop: 16,
            borderTop: `1px solid ${COLORS.paperLine}`,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.inkFaint }}>
              タイマーを表示
            </span>
            <ToggleSwitch checked={showTimer} onChange={onToggleTimer} small />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.inkFaint }}>
                でばっぐ：出題数
              </span>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 11, fontWeight: 700, color: COLORS.inkFaint }}>
                {questionsPerSheet}もん
              </span>
            </div>
            <input
              type="range"
              min={MIN_QUESTIONS_PER_SHEET}
              max={QUESTIONS_PER_SHEET}
              value={questionsPerSheet}
              onChange={(e) => onChangeQuestionsPerSheet(Number(e.target.value))}
              style={{ width: "100%", height: 14, accentColor: COLORS.teal }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
