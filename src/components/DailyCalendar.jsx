import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COLORS, FONT_DISPLAY } from "../constants";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function DailyCalendar({ sheets }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-11

  const countsByDate = sheets.reduce((acc, s) => {
    acc[s.date] = (acc[s.date] || 0) + 1;
    return acc;
  }, {});

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startWeekday = new Date(viewYear, viewMonth, 1).getDay(); // 0 = 日曜

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayDateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: COLORS.ink }}>
          ひにちの きろく
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={goToPrevMonth} style={navButtonStyle}>
            <ChevronLeft size={15} color={COLORS.inkSoft} />
          </button>
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 13,
              fontWeight: 700,
              color: COLORS.inkSoft,
              minWidth: 80,
              textAlign: "center",
            }}
          >
            {viewYear}ねん {viewMonth + 1}がつ
          </span>
          <button onClick={goToNextMonth} style={navButtonStyle}>
            <ChevronRight size={15} color={COLORS.inkSoft} />
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: COLORS.inkFaint, paddingBottom: 4 }}
          >
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`blank-${i}`} />;
          const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`;
          const count = countsByDate[dateStr] || 0;
          const isToday = dateStr === todayDateStr;
          return (
            <div
              key={dateStr}
              style={{
                aspectRatio: "1 / 1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                backgroundColor: count > 0 ? COLORS.levelSelBg : "transparent",
                border: `2px solid ${isToday ? COLORS.teal : "transparent"}`,
                boxSizing: "border-box",
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: count > 0 ? COLORS.ink : COLORS.inkFaint }}>
                {d}
              </span>
              {count > 0 && (
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: 10, fontWeight: 700, color: COLORS.tealDark }}>
                  {count}まい
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const navButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 22,
  height: 22,
  borderRadius: 6,
  border: `1px solid ${COLORS.keyBorder}`,
  backgroundColor: "#FFFFFF",
  cursor: "pointer",
  padding: 0,
};
