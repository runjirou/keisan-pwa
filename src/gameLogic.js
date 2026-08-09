import { COLORS, QUESTIONS_PER_SHEET, TIME_THRESHOLDS } from "./constants";

export function todayStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

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

export function generateProblem(level) {
  if (level === 1) return genNoCarry();
  // レベル2: 8割 繰り上がりあり／2割 繰り上がりなし
  return Math.random() < 0.8 ? genCarry() : genNoCarry();
}

export function scoreMeta(score) {
  const pct = Math.round((score / QUESTIONS_PER_SHEET) * 100);
  if (pct >= 100) return { bg: COLORS.blue, fg: "#FFFFFF", label: "超すごい！" };
  if (pct >= 80) return { bg: COLORS.green, fg: "#FFFFFF", label: "すごい！" };
  if (pct >= 50) return { bg: COLORS.green, fg: "#FFFFFF", label: "やったね！" };
  return { bg: COLORS.paperLine, fg: COLORS.inkSoft, label: "がんばれ！" };
}

export function timeMeta(seconds, level) {
  const threshold = TIME_THRESHOLDS[level];
  if (seconds <= threshold) return { bg: COLORS.blue, label: "超すごい！" };
  return { bg: COLORS.green, label: "すごい！" };
}
