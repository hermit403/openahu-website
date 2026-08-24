import { animate } from "animejs/animation";
import { cubicBezier } from "animejs/easings/cubic-bezier";
import { navigate } from "astro:transitions/client";

type IndicatorState = {
  x: number;
  width: number;
};

type IndicatorAnimation = {
  cancel: () => unknown;
};

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const indicatorStates = new WeakMap<HTMLElement, IndicatorState>();
const indicatorAnimations = new WeakMap<HTMLElement, IndicatorAnimation>();

const normalizePath = (path: string) =>
  path === "/" ? path : path.replace(/\/+$/, "");

const getCurrentLink = (nav: HTMLElement) => {
  const currentPath = normalizePath(window.location.pathname);
  const links = Array.from(
    nav.querySelectorAll<HTMLAnchorElement>("[data-route-link]"),
  );

  return (
    links.find(
      (link) =>
        normalizePath(link.dataset.routePath ?? link.pathname) === currentPath,
    ) ?? null
  );
};

const updateCurrentState = (
  nav: HTMLElement,
  activeLink: HTMLAnchorElement,
) => {
  nav
    .querySelectorAll<HTMLAnchorElement>("[data-route-link]")
    .forEach((link) => {
      const isActive = link === activeLink;
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
};

const renderIndicator = (indicator: HTMLElement, state: IndicatorState) => {
  indicator.style.width = `${state.width}px`;
  indicator.style.transform = `translate3d(${state.x}px, 0, 0) scaleX(1)`;
};

const moveIndicator = (
  nav: HTMLElement,
  activeLink: HTMLAnchorElement,
  shouldAnimate: boolean,
  onSettled?: () => void,
) => {
  const indicator = nav.querySelector<HTMLElement>("[data-route-indicator]");
  if (!indicator) return;

  const target = {
    x: activeLink.offsetLeft,
    width: activeLink.offsetWidth,
  };
  const current = indicatorStates.get(nav);

  updateCurrentState(nav, activeLink);

  if (!current || reducedMotion || !shouldAnimate) {
    indicatorAnimations.get(nav)?.cancel();
    indicatorAnimations.delete(nav);
    indicatorStates.set(nav, target);
    renderIndicator(indicator, target);
    nav.dataset.indicatorReady = "";
    onSettled?.();
    return;
  }

  if (
    Math.abs(current.x - target.x) < 0.5 &&
    Math.abs(current.width - target.width) < 0.5
  ) {
    if (!indicatorAnimations.has(nav)) renderIndicator(indicator, target);
    onSettled?.();
    return;
  }

  const navRect = nav.getBoundingClientRect();
  const currentRect = indicator.getBoundingClientRect();
  const fromX = currentRect.left - navRect.left;
  const fromScaleX = Math.max(0.72, currentRect.width / target.width);
  const distance = target.x - fromX;
  const stretch = 1 + Math.min(0.095, Math.abs(distance) / 720);

  indicatorAnimations.get(nav)?.cancel();
  indicator.style.width = `${target.width}px`;
  indicator.style.transformOrigin =
    distance >= 0 ? "left center" : "right center";
  indicator.style.transform = `translate3d(${fromX}px, 0, 0) scaleX(${fromScaleX})`;
  indicatorStates.set(nav, target);
  nav.dataset.indicatorReady = "";

  const animation = animate(indicator, {
    x: {
      from: fromX,
      to: target.x,
      duration: 360,
      ease: cubicBezier(0.32, 0.02, 0.18, 1),
    },
    scaleX: [
      {
        from: fromScaleX,
        to: stretch,
        duration: 130,
        ease: cubicBezier(0.22, 0.7, 0.24, 1),
      },
      {
        to: 1,
        duration: 230,
        ease: cubicBezier(0.3, 0.02, 0.2, 1),
      },
    ],
    onComplete: () => {
      renderIndicator(indicator, target);
      indicator.style.transformOrigin = "left center";
      indicatorAnimations.delete(nav);
      onSettled?.();
    },
  });

  indicatorAnimations.set(nav, animation);
};

const refreshNavigation = (shouldAnimate: boolean) => {
  document.querySelectorAll<HTMLElement>("[data-route-nav]").forEach((nav) => {
    if (nav.closest("[inert]")) return;
    const activeLink = getCurrentLink(nav);
    if (activeLink) moveIndicator(nav, activeLink, shouldAnimate);
  });
};

let navigationRequest = 0;

document.addEventListener(
  "click",
  (event) => {
    if (
      !(event instanceof MouseEvent) ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !(event.target instanceof Element)
    ) {
      return;
    }

    const link = event.target.closest<HTMLAnchorElement>("[data-route-link]");
    const nav = link?.closest<HTMLElement>("[data-route-nav]");
    if (!link || !nav || link.target === "_blank") return;

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin) return;

    event.preventDefault();
    const pendingTarget = indicatorStates.get(nav);
    if (
      indicatorAnimations.has(nav) &&
      pendingTarget &&
      Math.abs(pendingTarget.x - link.offsetLeft) < 0.5 &&
      Math.abs(pendingTarget.width - link.offsetWidth) < 0.5
    ) {
      return;
    }

    const request = ++navigationRequest;
    const isCurrentRoute =
      normalizePath(destination.pathname) ===
      normalizePath(window.location.pathname);

    moveIndicator(nav, link, true, () => {
      if (request !== navigationRequest || isCurrentRoute) return;
      void navigate(destination.href);
    });
  },
  { capture: true },
);

document.addEventListener("astro:page-load", () => refreshNavigation(true));

let resizeFrame = 0;
window.addEventListener(
  "resize",
  () => {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      refreshNavigation(false);
    });
  },
  { passive: true },
);

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    () => refreshNavigation(false),
    {
      once: true,
    },
  );
} else {
  refreshNavigation(false);
}
