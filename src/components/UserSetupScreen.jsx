import { useState } from "react";
import { Play } from "lucide-react";
import { COLORS, FONT_DISPLAY, FONT_BODY, MAX_USER_NAME_LENGTH } from "../constants";
import { pressHandlers } from "../pressHandlers";

export default function UserSetupScreen({ onCreateUser }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const result = onCreateUser(name);
    if (!result.ok) {
      setError(result.error);
    }
  };

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
      <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 26,
            fontWeight: 700,
            color: COLORS.ink,
            margin: 0,
            textAlign: "center",
          }}
        >
          けいさんプリント
        </h1>
        <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.inkSoft, margin: 0, textAlign: "center" }}>
          さいしょに なまえを にゅうりょくしてね
        </p>

        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          maxLength={MAX_USER_NAME_LENGTH}
          placeholder="なまえ"
          autoFocus
          style={{
            width: "100%",
            fontFamily: FONT_DISPLAY,
            fontSize: 20,
            fontWeight: 700,
            textAlign: "center",
            color: COLORS.ink,
            padding: "14px 16px",
            borderRadius: 16,
            border: `2px solid ${COLORS.keyBorder}`,
            boxSizing: "border-box",
          }}
        />

        {error && (
          <span style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 800, color: COLORS.coral }}>
            {error}
          </span>
        )}

        <button
          onClick={handleSubmit}
          style={{
            fontFamily: FONT_DISPLAY,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 20,
            border: "none",
            background: COLORS.teal,
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: 700,
            padding: "18px 0",
            boxShadow: `0 5px 0 ${COLORS.tealDark}`,
            cursor: "pointer",
          }}
          {...pressHandlers(`0 5px 0 ${COLORS.tealDark}`)}
        >
          <Play size={20} fill="#FFFFFF" />
          はじめる
        </button>
      </div>
    </div>
  );
}
