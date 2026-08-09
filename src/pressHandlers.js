// ボタン押下時に影を消してへこませ、離したら戻すエフェクト
export function pressHandlers(colorShadow) {
  return {
    onMouseDown: (e) => {
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.transform = "translateY(4px)";
    },
    onMouseUp: (e) => {
      e.currentTarget.style.boxShadow = colorShadow;
      e.currentTarget.style.transform = "translateY(0)";
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.boxShadow = colorShadow;
      e.currentTarget.style.transform = "translateY(0)";
    },
    onTouchStart: (e) => {
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.transform = "translateY(4px)";
    },
    onTouchEnd: (e) => {
      e.currentTarget.style.boxShadow = colorShadow;
      e.currentTarget.style.transform = "translateY(0)";
    },
  };
}
