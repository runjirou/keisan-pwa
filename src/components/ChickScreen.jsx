import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Sparkles, Star } from "lucide-react";
import { COLORS, FONT_DISPLAY, CHICK_STAGES, CHICK_FEED_COST } from "../constants";
import { chickStageIndex } from "../gameLogic";
import { pressHandlers } from "../pressHandlers";
import ChickIllustration from "./ChickIllustration";

const WHITEOUT_MS = 350; // 画像部分がホワイトアウトしている時間
const SPARKLE_MS = 500; // ✨ポップを見せる時間

const MAX_STAGE = CHICK_STAGES[CHICK_STAGES.length - 1];

export default function ChickScreen({ points, chickGrowth, onFeed, onBack }) {
  const growth = chickGrowth ?? 0;

  // すがたが変わる（＝画像が切り替わる）ときだけ
  // 「ホワイトアウト → 画像入れ替わり（＋テキスト更新） → ✨ポップ」の順で演出する。
  // すがたが変わらない普通のエサやりはエフェクトなしで即時反映する。
  const [displayGrowth, setDisplayGrowth] = useState(growth);
  const [showWhiteout, setShowWhiteout] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const prevGrowthRef = useRef(growth);
  const prevStageRef = useRef(chickStageIndex(growth));
  const timersRef = useRef([]);

  useEffect(() => {
    if (growth === prevGrowthRef.current) return;
    prevGrowthRef.current = growth;

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const newStage = chickStageIndex(growth);
    if (newStage === prevStageRef.current) {
      setDisplayGrowth(growth);
      return;
    }
    prevStageRef.current = newStage;

    setShowWhiteout(true);
    const whiteoutTimer = setTimeout(() => {
      setShowWhiteout(false);
      setDisplayGrowth(growth);
      setShowSparkle(true);
      const sparkleTimer = setTimeout(() => {
        setShowSparkle(false);
      }, SPARKLE_MS);
      timersRef.current.push(sparkleTimer);
    }, WHITEOUT_MS);
    timersRef.current.push(whiteoutTimer);
  }, [growth]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const stageIndex = chickStageIndex(displayGrowth);
  const stage = CHICK_STAGES[stageIndex];
  const nextStage = CHICK_STAGES[stageIndex + 1];
  const isEgg = stageIndex === 0;
  const isMax = !nextStage;
  const canAfford = points >= CHICK_FEED_COST;

  const actionLabel = isEgg ? "たまごをあたためる" : "エサをあげる";
  const progress = nextStage
    ? Math.min(1, (displayGrowth - stage.growthRequired) / (nextStage.growthRequired - stage.growthRequired))
    : 1;
  const postMaxFeedCount = isMax ? Math.max(0, displayGrowth - MAX_STAGE.growthRequired) : 0;

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <button
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              padding: 4,
              cursor: "pointer",
              color: COLORS.inkSoft,
            }}
          >
            <ArrowLeft size={16} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>メニューへ</span>
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              backgroundColor: COLORS.levelSelBg,
              borderRadius: 999,
              padding: "3px 10px",
            }}
          >
            <Star size={12} color={COLORS.yellow} fill={COLORS.yellow} />
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 12, fontWeight: 700, color: COLORS.ink }}>
              {points}pt
            </span>
          </div>
        </div>

        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 24,
            fontWeight: 700,
            color: COLORS.ink,
            margin: 0,
            textAlign: "center",
          }}
        >
          ひよこをそだてよう
        </h1>

        <div
          style={{
            position: "relative",
            marginTop: 24,
            width: "100%",
            aspectRatio: "1 / 1",
            maxHeight: 260,
            borderRadius: 28,
            backgroundColor: COLORS.levelSelBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
            padding: 20,
            overflow: "hidden",
          }}
        >
          <div key={stageIndex} style={{ width: "70%", height: "70%" }}>
            <ChickIllustration stage={stageIndex} />
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#FFFFFF",
              opacity: showWhiteout ? 1 : 0,
              transition: "opacity 0.15s",
              pointerEvents: "none",
            }}
          />

          {showSparkle && (
            <>
              <Sparkles
                size={28}
                color={COLORS.yellow}
                fill={COLORS.yellow}
                style={{ position: "absolute", top: 14, left: 14, animation: "pop 0.3s ease-out", pointerEvents: "none" }}
              />
              <Sparkles
                size={28}
                color={COLORS.yellow}
                fill={COLORS.yellow}
                style={{ position: "absolute", bottom: 14, right: 14, animation: "pop 0.3s ease-out", pointerEvents: "none" }}
              />
            </>
          )}
        </div>

        <p
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 18,
            fontWeight: 700,
            color: COLORS.ink,
            textAlign: "center",
            marginTop: 14,
            marginBottom: 4,
          }}
        >
          {stage.label}
        </p>

        <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.inkSoft, textAlign: "center", margin: 0 }}>
          {isMax
            ? postMaxFeedCount > 0
              ? `まんぷくごはんを ${postMaxFeedCount}かい あげたよ！`
              : "さいだいまで そだったよ！"
            : `つぎの すがたまで あと ${nextStage.growthRequired - displayGrowth}かい`}
        </p>

        {!isMax && (
          <div
            style={{
              marginTop: 10,
              width: "100%",
              height: 10,
              borderRadius: 999,
              backgroundColor: COLORS.paperLine,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 999,
                backgroundColor: COLORS.teal,
                transition: "width 0.3s",
                width: `${progress * 100}%`,
              }}
            />
          </div>
        )}

        <button
          onClick={onFeed}
          disabled={!canAfford}
          style={{
            fontFamily: FONT_DISPLAY,
            marginTop: 24,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 20,
            border: "none",
            background: canAfford ? COLORS.teal : COLORS.paperLine,
            color: canAfford ? "#FFFFFF" : COLORS.inkFaint,
            fontSize: 18,
            fontWeight: 700,
            padding: "18px 0",
            boxShadow: canAfford ? `0 5px 0 ${COLORS.tealDark}` : "none",
            cursor: canAfford ? "pointer" : "default",
          }}
          {...pressHandlers(canAfford ? `0 5px 0 ${COLORS.tealDark}` : "none")}
        >
          {actionLabel}（-{CHICK_FEED_COST}pt）
        </button>

        {!canAfford && (
          <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.coral, textAlign: "center", marginTop: 10 }}>
            ポイントが たりないよ。プリントを といて ポイントを ためよう！
          </p>
        )}
      </div>
    </div>
  );
}
