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
  onClick?: () => void;
}

export default function LiquidContainer({
  children,
  className = "",
  padding = "1rem",
  radius = 16,
  displacementScale = 64,
  blurAmount = 0.0625,
  saturation = 140,
  aberrationIntensity = 2,
  elasticity = 0.15,
  overLight = false,
  mode = "standard",
  variant = "block",
  fill = false,
  layoutMode = "overlay",
  onClick,
}: LiquidContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
          mouseContainer={containerRef}
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
        mouseContainer={containerRef}
        className={liquidClassName}
        style={{ position: "absolute", top: "50%", left: "50%" }}
        onClick={onClick}
      >
        <div className="relative z-10 pointer-events-auto">{children}</div>
      </LiquidGlass>
    </div>
  );
}
