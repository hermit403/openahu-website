import { animate } from "animejs/animation";
import { createDraggable, type Draggable } from "animejs/draggable";
import { cubicBezier } from "animejs/easings/cubic-bezier";
import { spring } from "animejs/easings/spring";
import { navigate } from "astro:transitions/client";
import { emitLiquidMotion } from "../lib/liquidMotion";

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
const indicatorDraggables = new WeakMap<HTMLElement, Draggable>();

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

const getIndicatorParts = (nav: HTMLElement) => ({
  indicator: nav.querySelector<HTMLElement>("[data-route-indicator]"),
  surface: nav.querySelector<HTMLElement>("[data-route-indicator-surface]"),
  dragHandle: nav.querySelector<HTMLElement>("[data-route-drag-handle]"),
});

const renderIndicator = (
  indicator: HTMLElement,
  dragHandle: HTMLElement,
  state: IndicatorState,
) => {
  [indicator, dragHandle].forEach((element) => {
    element.style.width = `${state.width}px`;
    element.style.transform = `translate3d(${state.x}px, 0, 0) scaleX(1)`;
  });
};

const clearDragState = (nav: HTMLElement) => {
  delete nav.dataset.indicatorDragging;
  delete nav.dataset.indicatorSettling;
};

const resistDrag = (limit: number) => (value: number) => {
  const distance = Math.abs(value);
  return Math.sign(value) * limit * (1 - Math.exp(-distance / limit));
};

const suspendIndicatorDrag = (nav: HTMLElement) => {
  const draggable = indicatorDraggables.get(nav);
  if (!draggable) return;

  draggable.reset();
  if (draggable.enabled) draggable.disable();
  clearDragState(nav);
};

const resumeIndicatorDrag = (nav: HTMLElement) => {
  const draggable = indicatorDraggables.get(nav);
  if (!draggable) return;

  draggable.refresh();
  if (!draggable.enabled) draggable.enable();
};

const setupIndicatorDrag = (nav: HTMLElement) => {
  if (reducedMotion || indicatorDraggables.has(nav)) return;

  const { surface, dragHandle } = getIndicatorParts(nav);
  if (!surface || !dragHandle) return;

  const draggable = createDraggable(surface, {
    trigger: dragHandle,
    x: { snap: [0], modifier: resistDrag(16) },
    y: { snap: [0], modifier: resistDrag(6) },
    dragSpeed: 1,
    dragThreshold: { mouse: 3, touch: 7 },
    velocityMultiplier: 0,
    releaseEase: spring({
      stiffness: 900,
      damping: 12,
    }),
    cursor: false,
    onGrab: () => {
      delete nav.dataset.indicatorSettling;
      nav.dataset.indicatorDragging = "";
    },
    onRelease: (released) => {
      delete nav.dataset.indicatorDragging;
      if (Math.hypot(released.x, released.y) < 0.1) {
        clearDragState(nav);
      } else {
        nav.dataset.indicatorSettling = "";
      }
    },
    onSettle: () => {
      clearDragState(nav);
    },
  });

  const forwardActiveLinkPress = (event: MouseEvent | TouchEvent) => {
    if (!draggable.enabled || !(event.target instanceof Element)) return;

    const activeLink = event.target.closest<HTMLAnchorElement>(
      "[data-route-link][aria-current='page']",
    );
    if (!activeLink || !nav.contains(activeLink)) return;

    event.preventDefault();
    draggable.handleDown(event);
  };

  const preventNativeLinkGesture = (event: Event) => {
    if (!(event.target instanceof Element)) return;
    if (
      event.target.closest(
        "[data-route-drag-handle], [data-route-link][aria-current='page']",
      )
    ) {
      event.preventDefault();
    }
  };

  nav.addEventListener("mousedown", forwardActiveLinkPress, {
    capture: true,
  });
  nav.addEventListener("touchstart", forwardActiveLinkPress, {
    capture: true,
    passive: false,
  });
  nav.addEventListener("dragstart", preventNativeLinkGesture, {
    capture: true,
  });
  nav.addEventListener("contextmenu", preventNativeLinkGesture, {
    capture: true,
  });

  indicatorDraggables.set(nav, draggable);
  nav.dataset.indicatorDraggable = "";
};

const moveIndicator = (
  nav: HTMLElement,
  activeLink: HTMLAnchorElement,
  shouldAnimate: boolean,
  onSettled?: () => void,
) => {
  const { indicator, dragHandle } = getIndicatorParts(nav);
  if (!indicator || !dragHandle) return;

  const target = {
    x: activeLink.offsetLeft,
    width: activeLink.offsetWidth,
  };
  const current = indicatorStates.get(nav);

  updateCurrentState(nav, activeLink);

  if (!current || reducedMotion || !shouldAnimate) {
    indicatorAnimations.get(nav)?.cancel();
    indicatorAnimations.delete(nav);
    indicatorDraggables.get(nav)?.reset();
    indicatorStates.set(nav, target);
    renderIndicator(indicator, dragHandle, target);
    resumeIndicatorDrag(nav);
    nav.dataset.indicatorReady = "";
    onSettled?.();
    return;
  }

  if (
    Math.abs(current.x - target.x) < 0.5 &&
    Math.abs(current.width - target.width) < 0.5
  ) {
    if (!indicatorAnimations.has(nav)) {
      indicatorDraggables.get(nav)?.reset();
      renderIndicator(indicator, dragHandle, target);
      resumeIndicatorDrag(nav);
    }
    onSettled?.();
    return;
  }

  const navRect = nav.getBoundingClientRect();
  const currentRect = indicator.getBoundingClientRect();
  const fromX = currentRect.left - navRect.left;
  const fromScaleX = Math.max(0.72, currentRect.width / target.width);
  const distance = target.x - fromX;
  const stretch = 1 + Math.min(0.095, Math.abs(distance) / 720);
  const stickyPull =
    Math.sign(distance) * Math.min(28, Math.abs(distance) * 0.42);

  indicatorAnimations.get(nav)?.cancel();
  suspendIndicatorDrag(nav);
  [indicator, dragHandle].forEach((element) => {
    element.style.width = `${target.width}px`;
    element.style.transformOrigin =
      distance >= 0 ? "left center" : "right center";
    element.style.transform = `translate3d(${fromX}px, 0, 0) scaleX(${fromScaleX})`;
  });
  indicatorStates.set(nav, target);
  nav.dataset.indicatorReady = "";

  const animation = animate([indicator, dragHandle], {
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
      renderIndicator(indicator, dragHandle, target);
      indicator.style.transformOrigin = "left center";
      dragHandle.style.transformOrigin = "left center";
      indicatorAnimations.delete(nav);
      resumeIndicatorDrag(nav);
      onSettled?.();
    },
  });

  const stickyMotion = { x: 0 };
  const stickyAnimation = animate(stickyMotion, {
    x: [
      {
        to: stickyPull,
        duration: 130,
        ease: cubicBezier(0.22, 0.7, 0.24, 1),
      },
      {
        to: stickyPull * 0.12,
        duration: 230,
        ease: cubicBezier(0.3, 0.02, 0.2, 1),
      },
    ],
    onUpdate: () => emitLiquidMotion(nav, { x: stickyMotion.x }),
    onComplete: () => emitLiquidMotion(nav, { release: true }),
  });

  indicatorAnimations.set(nav, {
    cancel: () => {
      animation.cancel();
      stickyAnimation.cancel();
      emitLiquidMotion(nav, { release: true });
    },
  });
};

const refreshNavigation = (shouldAnimate: boolean) => {
  document.querySelectorAll<HTMLElement>("[data-route-nav]").forEach((nav) => {
    if (nav.closest("[inert]")) return;
    const activeLink = getCurrentLink(nav);
    if (!activeLink) return;

    moveIndicator(nav, activeLink, shouldAnimate);
    setupIndicatorDrag(nav);
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
