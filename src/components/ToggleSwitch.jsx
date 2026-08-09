import { COLORS } from "../constants";

export default function ToggleSwitch({ checked, onChange, small }) {
  const width = small ? 34 : 46;
  const height = small ? 20 : 26;
  const thumbSize = small ? 14 : 20;
  const inset = small ? 3 : 3;

  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width,
        height,
        borderRadius: 999,
        border: "none",
        backgroundColor: checked ? COLORS.teal : COLORS.keyBorder,
        position: "relative",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: inset,
          left: checked ? width - thumbSize - inset : inset,
          width: thumbSize,
          height: thumbSize,
          borderRadius: "50%",
          backgroundColor: "#FFFFFF",
          transition: "left 0.15s",
          boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
        }}
      />
    </button>
  );
}
