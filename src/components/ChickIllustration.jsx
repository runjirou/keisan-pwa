import { CHICK_STAGES } from "../constants";

// stage: CHICK_STAGES のインデックス（0=たまご 〜 5=まんまるひよこ）
export default function ChickIllustration({ stage }) {
  const clamped = Math.max(0, Math.min(stage, CHICK_STAGES.length - 1));
  const { image, label } = CHICK_STAGES[clamped];

  return (
    <img
      src={`${import.meta.env.BASE_URL}images/${image}`}
      alt={label}
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  );
}
