import React, { useEffect, useRef, useState } from "react";
import { animate } from "animejs/animation";
import { spring } from "animejs/easings/spring";
import LiquidGlassModule from "liquid-glass-react";
import {
  LIQUID_MOTION_EVENT,
  type LiquidMotionDetail,
} from "../../lib/liquidMotion";

type LiquidGlassComponent = typeof LiquidGlassModule;
const liquidGlassExport = LiquidGlassModule as unknown as
  LiquidGlassComponent | { default: LiquidGlassComponent };
const LiquidGlass =
  typeof liquidGlassExport === "function"
    ? liquidGlassExport
    : liquidGlassExport.default;

type LiquidMode = "standard" | "polar" | "prominent" | "shader";
type InteractionMode = "hover" | "press" | "hover-press";

interface LiquidContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  radius?: number;
  displacementScale?: number;
  blurAmount?: number;
  saturation?: number;
  aberrationIntensity?: number;
  elasticity?: number;
  overLight?: boolean;
  mode?: LiquidMode;
  variant?: "pill" | "block";
  fill?: boolean;
  layoutMode?: "overlay" | "inline";
  interactive?: boolean;
  interactionMode?: InteractionMode;
  interactionTarget?: string;
  touchElastic?: boolean;
  onClick?: () => void;
}

interface PointerState {
  globalMousePos: { x: number; y: number };
  mouseOffset: { x: number; y: number };
}

export default function LiquidContainer({
  children,
  className = "",
  padding = "1rem",
  radius = 16,
  displacementScale = 54,
  blurAmount = 0.1,
  saturation = 124,
  aberrationIntensity = 2.4,
  elasticity = 0.29,
  overLight = false,
  mode = "standard",
  variant = "block",
  fill = false,
  layoutMode = "overlay",
  interactive = true,
  interactionMode = "hover",
  interactionTarget,
  touchElastic = false,
  onClick,
}: LiquidContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const releaseAnimationRef = useRef<{ cancel: () => unknown } | null>(null);
  const touchScaleAnimationRef = useRef<{ cancel: () => unknown } | null>(null);
  const moveRafRef = useRef<number | null>(null);
  const latestPointerRef = useRef<{ x: number; y: number } | null>(null);

  const getRestPointerState = (): PointerState => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return {
        globalMousePos: { x: 0, y: 0 },
        mouseOffset: { x: 0, y: 0 },
      };
    }

    return {
      globalMousePos: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      },
      mouseOffset: { x: 0, y: 0 },
    };
  };

  const [pointerState, setPointerState] = useState<PointerState>({
    globalMousePos: { x: 0, y: 0 },
    mouseOffset: { x: 0, y: 0 },
  });
  const pointerStateRef = useRef(pointerState);

  useEffect(() => {
    pointerStateRef.current = pointerState;
  }, [pointerState]);

  useEffect(() => {
    const syncRestPointerState = () => {
      const next = getRestPointerState();
      pointerStateRef.current = next;
      setPointerState(next);
    };

    syncRestPointerState();
    window.addEventListener("resize", syncRestPointerState);

    return () => {
      window.removeEventListener("resize", syncRestPointerState);
    };
  }, []);

  useEffect(() => {
    if (!interactive) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }
    const finePointer = window.matchMedia("(pointer: fine)");
    const pressInteraction = interactionMode !== "hover";
    const hoverInteraction = interactionMode !== "press";
    let activePointerId: number | null = null;
    let pointerStart = { x: 0, y: 0 };

    const stopRelease = () => {
      if (releaseAnimationRef.current !== null) {
        releaseAnimationRef.current.cancel();
        releaseAnimationRef.current = null;
      }
    };

    const stopMove = () => {
      if (moveRafRef.current !== null) {
        cancelAnimationFrame(moveRafRef.current);
        moveRafRef.current = null;
      }
      latestPointerRef.current = null;
    };

    const stopTouchScale = () => {
      touchScaleAnimationRef.current?.cancel();
      touchScaleAnimationRef.current = null;
    };

    const updatePointerState = (
      clientX: number,
      clientY: number,
      offsetScale = 1,
    ) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const next = {
        globalMousePos: { x: clientX, y: clientY },
        mouseOffset: {
          x: rect.width
            ? ((clientX - centerX) / rect.width) * 100 * offsetScale
            : 0,
          y: rect.height
            ? ((clientY - centerY) / rect.height) * 100 * offsetScale
            : 0,
        },
      };

      pointerStateRef.current = next;
      setPointerState(next);
    };

    const animateRelease = (releaseTouchScale = false) => {
      stopRelease();
      const startState = pointerStateRef.current;
      const endState = getRestPointerState();
      const releaseValues = {
        globalX: startState.globalMousePos.x,
        globalY: startState.globalMousePos.y,
        offsetX: startState.mouseOffset.x,
        offsetY: startState.mouseOffset.y,
      };

      releaseAnimationRef.current = animate(releaseValues, {
        globalX: endState.globalMousePos.x,
        globalY: endState.globalMousePos.y,
        offsetX: 0,
        offsetY: 0,
        duration: 320,
        ease: spring({ duration: 320, bounce: 0.12 }),
        onUpdate: () => {
          const next = {
            globalMousePos: {
              x: releaseValues.globalX,
              y: releaseValues.globalY,
            },
            mouseOffset: {
              x: releaseValues.offsetX,
              y: releaseValues.offsetY,
            },
          };

          pointerStateRef.current = next;
          setPointerState(next);
        },
        onComplete: () => {
          pointerStateRef.current = endState;
          setPointerState(endState);
          releaseAnimationRef.current = null;
        },
      });

      if (releaseTouchScale) {
        stopTouchScale();
        delete container.dataset.touchActive;
        container.style.willChange = "transform";
        touchScaleAnimationRef.current = animate(container, {
          scale: { to: 1, duration: 340 },
          ease: spring({ duration: 340, bounce: 0.1 }),
          onComplete: () => {
            container.style.removeProperty("transform");
            container.style.removeProperty("will-change");
            touchScaleAnimationRef.current = null;
          },
        });
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (activePointerId === event.pointerId) {
        if (pressInteraction) {
          const rect = container.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const resist = (value: number, limit: number) =>
            Math.sign(value) * limit * (1 - Math.exp(-Math.abs(value) / limit));

          updatePointerState(
            centerX + resist(event.clientX - pointerStart.x, rect.width * 0.1),
            centerY +
              resist(event.clientY - pointerStart.y, rect.height * 0.22),
          );
          return;
        }

        const travelX = Math.abs(event.clientX - pointerStart.x);
        const travelY = Math.abs(event.clientY - pointerStart.y);
        if (Math.max(travelX, travelY) > 12) {
          activePointerId = null;
          animateRelease(true);
          return;
        }
        updatePointerState(event.clientX, event.clientY, 0.56);
        return;
      }

      if (!hoverInteraction) return;
      if (!finePointer.matches || event.pointerType === "touch") return;
      stopRelease();
      latestPointerRef.current = { x: event.clientX, y: event.clientY };
      if (moveRafRef.current !== null) return;

      moveRafRef.current = requestAnimationFrame(() => {
        moveRafRef.current = null;
        const latestPointer = latestPointerRef.current;
        if (latestPointer) {
          updatePointerState(latestPointer.x, latestPointer.y);
        }
      });
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (pressInteraction) {
        if (!event.isPrimary) return;
        if (
          interactionTarget &&
          (!(event.target instanceof Element) ||
            !event.target.closest(interactionTarget))
        ) {
          return;
        }

        stopRelease();
        stopMove();
        activePointerId = event.pointerId;
        pointerStart = { x: event.clientX, y: event.clientY };
        return;
      }

      if (!touchElastic || event.pointerType !== "touch" || !event.isPrimary) {
        return;
      }

      stopRelease();
      stopMove();
      stopTouchScale();
      activePointerId = event.pointerId;
      pointerStart = { x: event.clientX, y: event.clientY };
      container.dataset.touchActive = "";
      container.style.willChange = "transform";
      updatePointerState(event.clientX, event.clientY, 0.56);
      touchScaleAnimationRef.current = animate(container, {
        scale: { to: 0.994, duration: 110 },
        ease: "outQuad",
      });
    };

    const finishPointer = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) return;
      activePointerId = null;
      if (pressInteraction) {
        animateRelease();
      } else {
        animateRelease(true);
      }
    };

    const handlePointerLeave = (event: PointerEvent) => {
      if (pressInteraction && activePointerId === event.pointerId) return;
      if (activePointerId === event.pointerId) {
        activePointerId = null;
        animateRelease(true);
        return;
      }
      if (finePointer.matches && event.pointerType !== "touch") {
        animateRelease();
      }
    };

    const handleWindowPointerMove = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) return;
      if (
        hoverInteraction &&
        event.target instanceof Node &&
        container.contains(event.target)
      ) {
        return;
      }
      handlePointerMove(event);
    };

    const handleLiquidMotion = (event: Event) => {
      if (activePointerId !== null) return;
      const {
        x = 0,
        y = 0,
        release = false,
      } = (event as CustomEvent<LiquidMotionDetail>).detail;

      if (release) {
        animateRelease();
        return;
      }

      stopRelease();
      stopMove();
      const rect = container.getBoundingClientRect();
      const limit = (value: number, maximum: number) =>
        Math.max(-maximum, Math.min(maximum, value));

      updatePointerState(
        rect.left + rect.width / 2 + limit(x, rect.width * 0.08),
        rect.top + rect.height / 2 + limit(y, rect.height * 0.2),
      );
    };

    if (hoverInteraction) {
      container.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
    }
    if (pressInteraction) {
      window.addEventListener("pointermove", handleWindowPointerMove, {
        passive: true,
      });
    }
    container.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
      capture: pressInteraction,
    });
    container.addEventListener(LIQUID_MOTION_EVENT, handleLiquidMotion);
    container.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("pointerup", finishPointer, { passive: true });
    window.addEventListener("pointercancel", finishPointer, { passive: true });

    return () => {
      stopRelease();
      stopMove();
      stopTouchScale();
      delete container.dataset.touchActive;
      container.style.removeProperty("transform");
      container.style.removeProperty("will-change");
      if (hoverInteraction) {
        container.removeEventListener("pointermove", handlePointerMove);
      }
      if (pressInteraction) {
        window.removeEventListener("pointermove", handleWindowPointerMove);
      }
      container.removeEventListener(
        "pointerdown",
        handlePointerDown,
        pressInteraction,
      );
      container.removeEventListener(LIQUID_MOTION_EVENT, handleLiquidMotion);
      container.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointerup", finishPointer);
      window.removeEventListener("pointercancel", finishPointer);
    };
  }, [interactive, interactionMode, interactionTarget, touchElastic]);

  const variantClass =
    variant === "pill"
      ? "liquid-surface liquid-pill"
      : "liquid-surface liquid-block";
  const liquidClassName =
    `${fill ? "liquid-fill w-full " : ""}${className}`.trim();
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const glass = container.querySelector<HTMLElement>(".glass");
    if (!glass) return;

    const syncHeight = () => {
      const nextHeight = Math.ceil(glass.getBoundingClientRect().height);
      if (nextHeight > 0) {
        setMeasuredHeight((current) =>
          current === nextHeight ? current : nextHeight,
        );
      }
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(glass);

    return () => observer.disconnect();
  }, []);

  if (layoutMode === "inline") {
    return (
      <div ref={containerRef} className={variantClass}>
        <LiquidGlass
          cornerRadius={radius}
          padding={padding}
          displacementScale={displacementScale}
          blurAmount={blurAmount}
          saturation={saturation}
          aberrationIntensity={aberrationIntensity}
          elasticity={elasticity}
          overLight={overLight}
          mode={mode}
          globalMousePos={pointerState.globalMousePos}
          mouseOffset={pointerState.mouseOffset}
          className={liquidClassName}
          onClick={onClick}
        >
          {children}
        </LiquidGlass>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`${variantClass} relative`}>
      <div
        ref={placeholderRef}
        aria-hidden="true"
        inert={true}
        className="pointer-events-none select-none invisible"
        style={
          measuredHeight === null
            ? { padding }
            : { height: measuredHeight, width: "100%" }
        }
      >
        {children}
      </div>

      <LiquidGlass
        cornerRadius={radius}
        padding={padding}
        displacementScale={displacementScale}
        blurAmount={blurAmount}
        saturation={saturation}
        aberrationIntensity={aberrationIntensity}
        elasticity={elasticity}
        overLight={overLight}
        mode={mode}
        globalMousePos={pointerState.globalMousePos}
        mouseOffset={pointerState.mouseOffset}
        className={liquidClassName}
        style={{ position: "absolute", top: "50%", left: "50%" }}
        onClick={onClick}
      >
        <div className="relative z-10 pointer-events-auto">{children}</div>
      </LiquidGlass>
    </div>
  );
}
