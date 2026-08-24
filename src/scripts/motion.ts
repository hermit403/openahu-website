import { animate } from "animejs/animation";

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
let suppressNextImmediateMotion = false;
const quietRoutePaths = new Set(["/", "/about"]);
const normalizePath = (path: string) =>
  path === "/" ? path : path.replace(/\/+$/, "");

document.addEventListener("astro:before-preparation", (event) => {
  const fromPath = normalizePath(event.from.pathname);
  const toPath = normalizePath(event.to.pathname);
  suppressNextImmediateMotion =
    quietRoutePaths.has(fromPath) && quietRoutePaths.has(toPath);
});

const finishMotion = (element: HTMLElement) => {
  element.removeAttribute("data-motion");
  delete element.dataset.motionRunning;
  element.style.removeProperty("opacity");
  element.style.removeProperty("transform");
  element.style.removeProperty("will-change");
};

const playMotion = (element: HTMLElement) => {
  if (element.dataset.motionRunning !== undefined) return;

  const y = Number(element.dataset.motionY ?? 18);
  const scale = Number(element.dataset.motionScale ?? 1);
  const duration = Number(element.dataset.motionDuration ?? 1000);
  const delay = Number(element.dataset.motionDelay ?? 0);
  const shouldFade = element.dataset.motionFade !== "false";

  element.dataset.motionRunning = "";
  element.style.willChange = shouldFade ? "opacity, transform" : "transform";

  animate(element, {
    ...(shouldFade ? { opacity: { from: 0, to: 1 } } : {}),
    y: { from: y, to: 0 },
    scale: { from: scale, to: 1 },
    duration,
    delay,
    ease: "outExpo",
    onComplete: () => finishMotion(element),
  });
};

const startMotion = () => {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>("[data-motion]"),
  );

  if (reducedMotion) {
    elements.forEach(finishMotion);
    document.documentElement.classList.remove("motion-capable");
    return;
  }

  const immediateElements = elements.filter(
    (element) => element.dataset.motionTrigger !== "view",
  );
  const suppressImmediateMotion = suppressNextImmediateMotion;
  suppressNextImmediateMotion = false;

  requestAnimationFrame(() => {
    immediateElements.forEach(
      suppressImmediateMotion ? finishMotion : playMotion,
    );
  });

  const viewportElements = elements.filter(
    (element) => element.dataset.motionTrigger === "view",
  );

  if (!("IntersectionObserver" in window)) {
    viewportElements.forEach(playMotion);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        observer.unobserve(element);
        playMotion(element);
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.12 },
  );

  viewportElements.forEach((element) => observer.observe(element));
};

document.addEventListener("astro:page-load", startMotion);

if (document.readyState === "complete") {
  startMotion();
}
