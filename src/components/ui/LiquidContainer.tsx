import React, { useEffect, useRef, useState } from "react";
// @ts-ignore
import LiquidGlassModule from "liquid-glass-react";

const LiquidGlass = (LiquidGlassModule as any).default ?? LiquidGlassModule;

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
  displacementScale = 48,
  blurAmount = 0.1,
  saturation = 120,
  aberrationIntensity = 2,
  elasticity = 0.2,
  overLight = false,
  mode = "standard",
  variant = "block",
  fill = false,
  layoutMode = "overlay",
  interactive = true,
  onClick,
}: LiquidContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const releaseRafRef = useRef<number | null>(null);

  // The library relies on SVG filter sizing; force a re-mount on theme switch
  // to avoid stale filter/backdrop artifacts across light/dark.
  const [key, setKey] = useState(0);
  useEffect(() => {
    const updateTheme = () => setKey((prev) => prev + 1);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          updateTheme();
          break;
        }
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

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

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const stopRelease = () => {
      if (releaseRafRef.current !== null) {
        cancelAnimationFrame(releaseRafRef.current);
        releaseRafRef.current = null;
      }
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
      const startTime = performance.now();
      const duration = 320;

      const step = (now: number) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const next = {
          globalMousePos: {
            x:
              startState.globalMousePos.x +
              (endState.globalMousePos.x - startState.globalMousePos.x) *
                eased,
            y:
              startState.globalMousePos.y +
              (endState.globalMousePos.y - startState.globalMousePos.y) *
                eased,
          },
          mouseOffset: {
            x:
              startState.mouseOffset.x +
              (endState.mouseOffset.x - startState.mouseOffset.x) * eased,
            y:
              startState.mouseOffset.y +
              (endState.mouseOffset.y - startState.mouseOffset.y) * eased,
          },
        };

        pointerStateRef.current = next;
        setPointerState(next);

        if (progress < 1) {
          releaseRafRef.current = requestAnimationFrame(step);
        } else {
          releaseRafRef.current = null;
        }
      };

      releaseRafRef.current = requestAnimationFrame(step);
    };

    const handlePointerMove = (event: PointerEvent) => {
      stopRelease();
      updatePointerState(event.clientX, event.clientY);
    };

    container.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    container.addEventListener("pointerleave", animateRelease);

    return () => {
      stopRelease();
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

  if (layoutMode === "inline") {
    return (
      <div ref={containerRef} className={variantClass}>
        {/* @ts-ignore */}
        <LiquidGlass
          key={key}
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

  // Overlay mode (recommended for layout correctness):
  // 1) An inert/hidden placeholder participates in layout so the container sizes correctly.
  // 2) The actual LiquidGlass is positioned absolutely and uses the library's intended centering transform.
  const placeholderRef = useRef<HTMLDivElement>(null);

  // Apply inert via DOM to avoid React type issues
  useEffect(() => {
    if (placeholderRef.current) {
      placeholderRef.current.setAttribute("inert", "");
    }
  }, []);

  return (
    <div ref={containerRef} className={`${variantClass} relative`}>
      {/* Layout placeholder: keeps dimensions without duplicating interactions */}
      <div
        ref={placeholderRef}
        aria-hidden="true"
        className="pointer-events-none select-none invisible"
      >
        {children}
      </div>

      {/* @ts-ignore */}
      <LiquidGlass
        key={key}
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
