import { COLORS, TIME_THRESHOLDS } from "./constants";

export function todayStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function genNoCarry() {
  // 答えs（2〜9）の組み合わせ数は s-1 通り（例: 2→1+1の1通り、9→1+8〜8+1の8通り）。
  // 答えを均等に選ぶと組み合わせ数が少ない答え（1+1など）が相対的に出やすくなるため、
  // 組み合わせ数に比例した重みで答えを選ぶことで、数字の組み合わせ全体が均等に出題されるようにする
  let r = Math.random() * 36; // 1+2+...+8 = 36
  let answer = 2;
  for (let weight = 1; weight <= 8; weight++) {
    if (r < weight) {
      answer = weight + 1;
      break;
    }
    r -= weight;
  }
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

export function scoreMeta(score, total) {
  const pct = Math.round((score / total) * 100);
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
