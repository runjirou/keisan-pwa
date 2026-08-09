export const COLORS = {
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

export const FONT_DISPLAY = "'Fredoka', 'Nunito', sans-serif";
export const FONT_BODY = "'Nunito', 'Hiragino Maru Gothic ProN', sans-serif";

export const QUESTIONS_PER_SHEET = 20;

export const LEVELS = [
  { id: 1, label: "レベル1", sub: "たしざん（くりあがりなし）" },
  { id: 2, label: "レベル2", sub: "たしざん（くりあがり中心）" },
];

// レベル別のタイム基準（秒）：この秒数以内なら「超すごい！」
export const TIME_THRESHOLDS = { 1: 20, 2: 30 };
