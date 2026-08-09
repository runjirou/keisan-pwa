import { COLORS, QUESTIONS_PER_SHEET, TIME_THRESHOLDS } from "./constants";

export function todayStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function genNoCarry() {
  // 先に答え（2〜9）を均等に選んでから a, b を決めることで、
  // 答えが9に偏らないようにする
  const answer = Math.floor(Math.random() * 8) + 2; // 2-9
  const a = Math.floor(Math.random() * (answer - 1)) + 1; // 1 〜 answer-1
  const b = answer - a;
  return { a, b, answer };
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
