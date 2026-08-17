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

export const QUESTIONS_PER_SHEET = 20; // デフォルト・スライダーの最大値
export const MIN_QUESTIONS_PER_SHEET = 1; // デバッグ用スライダーの最小値

export const LEVELS = [
  { id: 1, label: "レベル1", sub: "たしざん（くりあがりなし）" },
  { id: 2, label: "レベル2", sub: "たしざん（くりあがり中心）" },
];

// レベル別のタイム基準（秒）：この秒数以内なら「超すごい！」
export const TIME_THRESHOLDS = { 1: 40, 2: 60 };

export const MAX_USER_NAME_LENGTH = 10;

// ひよこそだて機能：1回の「あたためる／エサをあげる」で消費するポイント
export const CHICK_FEED_COST = 5;

// growthRequired は「あたためる／エサをあげる」の累計回数のしきい値
// ニワトリには進化せず、ひよこのまま最終ステージ（まんまるひよこ）で成長が止まる
// image は public/images/ 以下のファイル名
export const CHICK_STAGES = [
  { id: 0, label: "たまご", growthRequired: 0, image: "tamago.png" },
  { id: 1, label: "うまれたてひよこ", growthRequired: 3, image: "hiyoko1.png" },
  { id: 2, label: "ちいさいひよこ", growthRequired: 18, image: "hiyoko2.png" },
  { id: 3, label: "ひよこ", growthRequired: 39, image: "hiyoko3.png" },
  { id: 4, label: "おおきいひよこ", growthRequired: 69, image: "hiyoko4.png" },
  { id: 5, label: "まんまるひよこ", growthRequired: 104, image: "hiyoko5.png" },
];
