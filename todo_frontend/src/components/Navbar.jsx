import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
} from "react";
import "./Navbar.css";

/**
 * PUBLIC_INTERFACE
 * Navbar component – fully reactive, adaptive, and accessible.
 *
 * @param {object} props
 * @param {string} [props.title="Todo"] - Brand/title to display.
 * @param {function} [props.onTitleClick] - Click handler for title (renders button if present).
 * @param {string|React.ElementType} [props.as="header"] - Polymorphic root element, e.g., "header", "nav".
 * @param {string} [props.className] - Extra classNames for root.
 * @param {boolean} [props.sticky=true] - Sticky positioning at top.
 * @param {boolean} [props.condenseOnScroll=true] - Reduce height/padding on scroll.
 * @param {boolean} [props.elevateOnScroll=true] - Apply shadow/border on scroll.
 * @param {boolean} [props.hideOnScroll=false] - Hide navbar when scrolling down, show when scrolling up.
 * @param {boolean} [props.transparent=false] - Overlay/transparent style (useful over hero).
 * @param {React.ReactNode} [props.actions] - Node for navbar right area (button/avatar etc).
 * @param {React.ReactNode} [props.children] - Can also use as actions slot (legacy).
 * @param {object} [rest] - All other props spread onto root.
 * 
 * Accessibility:
 * - Uses semantic landmarks (<header>/<nav>), aria-label, visible focus style.
 * - Respects prefers-reduced-motion for transitions.
 * - SSR/runtime safe: does not throw if window is undefined.
 *
 * Styling:
 * - Sets BEM-ish/data-* attributes for state: elevated, compact, hidden, transparent.
 * - Integrates with theme tokens for surface/background/primary/text.
 * 
 * Example:
 *   <Navbar title="Todo" hideOnScroll actions={<Button>Sign In</Button>} />
 */

const Navbar = forwardRef(function Navbar(
  {
    title = "Todo",
    onTitleClick,
    as: RootEl = "header",
    className = "",
    sticky = true,
    condenseOnScroll = true,
    elevateOnScroll = true,
    hideOnScroll = false,
    transparent = false,
    actions,
    children,
    ...rest
  },
  ref
) {
  // SSR safety: only listen to scroll in browser
  const isBrowser = typeof window !== "undefined";

  // State: scrollY, direction, compact/elevated/hidden states
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(false);
  const [elevated, setElevated] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Track scroll direction (for hideOnScroll), last scroll position
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Prefer reduced motion detection
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (!isBrowser) return;
    const matchPref = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(matchPref.matches);
    const handler = () => setReducedMotion(matchPref.matches);
    matchPref.addEventListener
      ? matchPref.addEventListener("change", handler)
      : matchPref.addListener && matchPref.addListener(handler);
    return () => {
      matchPref.removeEventListener
        ? matchPref.removeEventListener("change", handler)
        : matchPref.removeListener && matchPref.removeListener(handler);
    };
    // eslint-disable-next-line
  }, []);

  // Main scroll logic (condense, elevate, hide)
  const handleScroll = useCallback(() => {
    if (!isBrowser) return;
    const currScroll = window.scrollY || window.pageYOffset || 0;
    const pastZero = currScroll > 0;

    // Elevation: shadow or border
    setElevated(elevateOnScroll && pastZero);

    // Compact: less padding/height if condenseOnScroll enabled or auto on scroll
    setCompact(condenseOnScroll && pastZero);

    // Scrolled for state (for possible use in class/data)
    setScrolled(pastZero);

    // Hide-on-scroll logic
    if (hideOnScroll) {
      const direction =
        currScroll > lastScrollY.current ? "down" : "up";
      if (currScroll < 8) {
        setHidden(false);
      } else if (direction === "down" && currScroll > 36) {
        setHidden(true);
      } else if (direction === "up") {
        setHidden(false);
      }
      lastScrollY.current = currScroll;
    }
  }, [isBrowser, elevateOnScroll, condenseOnScroll, hideOnScroll]);

  useEffect(() => {
    if (!isBrowser) return;
    // Only listen if any scroll-based behavior
    if (!elevateOnScroll && !condenseOnScroll && !hideOnScroll) return;
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // On mount, call once in case already scrolled
    handleScroll();
    return () => window.removeEventListener("scroll", onScroll, { passive: true });
    // eslint-disable-next-line
  }, [handleScroll, elevateOnScroll, condenseOnScroll, hideOnScroll]);

  // Data attributes/stateful classes for styling
  const rootClass = [
    "navbar",
    sticky ? "navbar--sticky" : "",
    transparent ? "navbar--transparent" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Note: spread root props; only assign data-* attributes for states
  const navDataAttrs = {
    "data-elevated": elevated ? "true" : undefined,
    "data-compact": compact ? "true" : undefined,
    "data-hidden": hidden ? "true" : undefined,
    "data-transparent": transparent ? "true" : undefined,
  };

  // Nav tag for nav context and ARIA
  const navLabel = "Main navigation";

  // Hide style: opacity/transform, no transitions if reduced motion
  const transitionClass = !reducedMotion
    ? "navbar-transition"
    : "navbar-transition--noanim";

  // Handle ref forwarding to root element
  const rootProps = {
    className: rootClass + " " + transitionClass,
    ref,
    ...navDataAttrs,
    ...rest,
    style: {
      ...(rest.style || {}),
      position:
        sticky !== false ? "sticky" : undefined,
      top: sticky !== false ? 0 : undefined,
      zIndex: 20,
      width: "100%",
      // Allow theme override for overlays
      background: transparent ? "transparent" : undefined,
    },
  };

  return (
    <RootEl {...rootProps}>
      <nav
        className="navbar-nav"
        aria-label={navLabel}
        tabIndex={-1}
        role="navigation"
      >
        <div className="navbar-brand">
          {onTitleClick ? (
            <button
              className="navbar-title navbar-title-btn"
              type="button"
              tabIndex={0}
              onClick={onTitleClick}
              aria-label={
                typeof title === "string"
                  ? `Go to home (${title})`
                  : "Go to home"
              }
            >
              {title}
            </button>
          ) : (
            <span className="navbar-title">{title}</span>
          )}
        </div>
        <div className="navbar-actions">
          {actions || children}
        </div>
      </nav>
    </RootEl>
  );
});

export default Navbar;
