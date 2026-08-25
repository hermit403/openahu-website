export const LIQUID_MOTION_EVENT = "openahu:liquid-motion";

export interface LiquidMotionDetail {
  x?: number;
  y?: number;
  release?: boolean;
}

export const emitLiquidMotion = (
  target: HTMLElement,
  detail: LiquidMotionDetail,
) => {
  target.dispatchEvent(
    new CustomEvent<LiquidMotionDetail>(LIQUID_MOTION_EVENT, {
      bubbles: true,
      detail,
    }),
  );
};
