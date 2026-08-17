import { COLORS, TIME_THRESHOLDS, CHICK_STAGES } from "./constants";

export function todayStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function genNoCarry() {
  // 答えs（2〜9）の組み合わせ数は s-1 通り（例: 2→1+1の1通り、9→1+8〜8+1の8通り）。
  // 組み合わせ数にそのまま比例させると重みの差が最大8倍まで開き、1+1のような
  // 組み合わせ数が少ない答えが出にくくなりすぎるため、平方根を取って傾斜を緩める
  // （差が約1〜2.8倍に圧縮され、少ない答えも出やすさを保ちつつ多い答えへの偏りも抑える）
  const weights = [1, 2, 3, 4, 5, 6, 7, 8].map(Math.sqrt); // 答え2〜9 に対応
  const total = weights.reduce((sum, w) => sum + w, 0);
  let r = Math.random() * total;
  let answer = 2;
  for (let i = 0; i < weights.length; i++) {
    if (r < weights[i]) {
      answer = i + 2;
      break;
    }
    r -= weights[i];
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

// 累計の「あたためる／エサをあげる」回数から、現在のひよこステージの index を求める
export function chickStageIndex(growth) {
  let stage = 0;
  for (let i = 0; i < CHICK_STAGES.length; i++) {
    if (growth >= CHICK_STAGES[i].growthRequired) stage = i;
  }
  return stage;
}
