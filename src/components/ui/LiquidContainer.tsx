import React, { useEffect, useRef, useState } from "react";
import { animate } from "animejs/animation";
import { spring } from "animejs/easings/spring";
import LiquidGlassModule from "liquid-glass-react";

type LiquidGlassComponent = typeof LiquidGlassModule;
const liquidGlassExport = LiquidGlassModule as unknown as
  LiquidGlassComponent | { default: LiquidGlassComponent };
const LiquidGlass =
  typeof liquidGlassExport === "function"
    ? liquidGlassExport
    : liquidGlassExport.default;

type LiquidMode = "standard" | "polar" | "prominent" | "shader";

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
  onClick,
}: LiquidContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const releaseAnimationRef = useRef<{ cancel: () => unknown } | null>(null);
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

    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

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

    const updatePointerState = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const next = {
        globalMousePos: { x: clientX, y: clientY },
        mouseOffset: {
          x: rect.width ? ((clientX - centerX) / rect.width) * 100 : 0,
          y: rect.height ? ((clientY - centerY) / rect.height) * 100 : 0,
        },
      };

      pointerStateRef.current = next;
      setPointerState(next);
    };

    const animateRelease = () => {
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
    };

    const handlePointerMove = (event: PointerEvent) => {
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

    container.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    container.addEventListener("pointerleave", animateRelease);

    return () => {
      stopRelease();
      stopMove();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", animateRelease);
    };
  }, [interactive]);

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
