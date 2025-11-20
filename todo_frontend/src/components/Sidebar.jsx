import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Sidebar.css";

/**
 * PUBLIC_INTERFACE
 * Sidebar component for navigation and content organization.
 *
 * Props:
 * - title: string, header title (default "Menu")
 * - items: array of { key, label, icon?, onClick?, href? }
 * - selectedKey: string, current selected key
 * - onSelect: function(key), called when an item is selected
 * - footer: React node to render at the bottom
 * - position: "left" | "right" (default: "left")
 * - width: string/number (default: 280px)
 * - collapsedWidth: string/number (default: 64px)
 * - isOpen: controlled mode open state
 * - onToggle: controlled mode toggle
 * - overlayBreakpoint: number (screen width for overlay, default: 768)
 * - className: extra CSS classes
 *
 * Controlled: pass isOpen and onToggle
 * Uncontrolled: internal open/collapse state
 * Responsive: overlays below overlayBreakpoint, docks above
 * Keyboard accessible: Escape closes overlay, focus trap (only when overlay)
 * Styling/Accessibility: ARIA roles/labels, focus rings, active/hover, transitions
 */
const Sidebar = React.forwardRef(
  (
    {
      title = "Menu",
      items = [],
      selectedKey,
      onSelect,
      footer,
      position = "left",
      width = 280,
      collapsedWidth = 64,
      isOpen: controlledOpen,
      onToggle,
      overlayBreakpoint = 768,
      className = "",
      ...rest
    },
    ref
  ) => {
    // Compute px string value
    const normalizePx = (val, fallback) => {
      if (val == null) return fallback;
      return typeof val === "number" ? `${val}px` : val;
    };

    // Responsive: overlay mode if screen <= breakpoint
    const [isOverlay, setIsOverlay] = useState(
      window?.innerWidth <= overlayBreakpoint
    );
    useEffect(() => {
      const handler = () => {
        setIsOverlay(window.innerWidth <= overlayBreakpoint);
      };
      window.addEventListener("resize", handler);
      handler();
      return () => window.removeEventListener("resize", handler);
    }, [overlayBreakpoint]);

    // Open/collapse state (uncontrolled if not provided)
    const [internalOpen, setInternalOpen] = useState(
      isOverlay ? false : true
    );
    useEffect(() => {
      // On responsive transition (dock<->overlay), close overlay by default
      setInternalOpen(isOverlay ? false : true);
    }, [isOverlay]);
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    // Collapsed state (for docked), separate from overlay open/closed
    const [collapsed, setCollapsed] = useState(false);
    useEffect(() => {
      // When overlay, sidebar always fully open or hidden
      if (isOverlay) setCollapsed(false);
    }, [isOverlay]);

    // Focus trap refs for overlay: sentinels, sidebar & close btn
    const sidebarRef = useRef(null);
    const firstSentinel = useRef(null);
    const lastSentinel = useRef(null);
    const prevActiveElement = useRef(null);

    // Close sidebar handler
    const handleToggle = (val) => {
      if (onToggle) {
        onToggle(typeof val === "boolean" ? val : !isOpen);
      } else {
        if (isOverlay) {
          setInternalOpen(typeof val === "boolean" ? val : !isOpen);
        } else {
          setCollapsed((c) => !c);
        }
      }
    };

    // Keyboard: Escape closes overlay, trap focus
    useEffect(() => {
      if (!isOverlay || !isOpen) return;
      const handleKey = (e) => {
        if (e.key === "Escape") {
          handleToggle(false);
        }
        // Trap focus inside
        if (
          e.key === "Tab" &&
          sidebarRef.current &&
          isOpen
        ) {
          const focusable = sidebarRef.current.querySelectorAll(
            "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
          );
          if (!focusable.length) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };
      document.addEventListener("keydown", handleKey, true);
      return () => document.removeEventListener("keydown", handleKey, true);
    }, [isOverlay, isOpen]);

    // Focus management when overlay opens
    useEffect(() => {
      if (isOverlay && isOpen) {
        prevActiveElement.current = document.activeElement;
        // Focus first focusable
        setTimeout(() => {
          if (sidebarRef.current) {
            const first = sidebarRef.current.querySelector(
              "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
            );
            if (first) first.focus();
          }
        }, 0);
        // Prevent background scroll
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
        // Restore focus
        if (prevActiveElement.current && typeof prevActiveElement.current.focus === "function") {
          prevActiveElement.current.focus();
        }
      }
      // Cleanup on unmount
      return () => { document.body.style.overflow = ""; };
    }, [isOverlay, isOpen]);

    // Overlay backdrop click closes
    const handleBackdrop = (e) => {
      if (e.target === e.currentTarget) handleToggle(false);
    };

    // Click on item
    const onItemClick = (item) => {
      if (item.onClick) item.onClick();
      if (onSelect) onSelect(item.key);
      if (isOverlay) handleToggle(false);
    };

    // Compose style values
    const actualWidth = collapsed ? normalizePx(collapsedWidth, "64px") : normalizePx(width, "280px");
    const sidebarStyle = {
      width: isOverlay ? "min(76vw, " + normalizePx(width, "280px") + ")" : actualWidth,
      minWidth: isOverlay ? "180px" : collapsed ? normalizePx(collapsedWidth, "64px") : normalizePx(width, "280px"),
      maxWidth: normalizePx(width, "280px"),
      boxShadow: "var(--shadow, 0 4px 20px 0 rgba(0,0,0,.06))",
      [position]: 0,
    };

    // ARIA/role values
    const navAriaLabel = typeof title === "string" ? title + " navigation" : "Sidebar navigation";

    // Overlay mode: sidebar as dialog, with backdrop
    const SidebarBody = (
      <aside
        ref={(node) => {
          sidebarRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={
          [
            "sidebar",
            collapsed ? "sidebar--collapsed" : "",
            isOverlay ? "sidebar--overlay" : "sidebar--docked",
            position === "right" ? "sidebar--right" : "sidebar--left",
            isOverlay && isOpen ? "sidebar--open" : "",
            className,
          ].filter(Boolean).join(" ")
        }
        role="navigation"
        aria-label={navAriaLabel}
        aria-modal={isOverlay ? true : undefined}
        tabIndex={-1}
        style={{
          ...sidebarStyle,
          left: position === "left" ? 0 : "unset",
          right: position === "right" ? 0 : "unset",
          zIndex: 40,
          transition: "width var(--transition,0.15s),min-width var(--transition,0.15s),box-shadow var(--transition,0.15s)",
        }}
        {...rest}
      >
        <div className="sidebar__container">
          {/* Header with toggle */}
          <div className="sidebar__header">
            <span className="sidebar__title">{title}</span>
            <button
              className="sidebar__toggle"
              type="button"
              onClick={handleToggle}
              aria-label={isOverlay ? (isOpen ? "Close sidebar" : "Open sidebar") : (collapsed ? "Expand sidebar" : "Collapse sidebar")}
              aria-expanded={!collapsed}
              tabIndex={0}
            >
              <span aria-hidden="true">{collapsed || isOverlay ? (
                // Hamburger menu
                <svg width="26" height="26" aria-hidden="true" focusable="false" style={{ display: "block" }} fill="none" viewBox="0 0 26 26">
                  <rect y="6" width="20" height="2.5" rx="1.25" fill="#3b82f6" />
                  <rect y="12" width="14" height="2.5" rx="1.25" fill="#3b82f6" />
                  <rect y="18" width="17" height="2.5" rx="1.25" fill="#3b82f6" />
                </svg>
              ) : (
                // Chevron/collapse
                <svg width="24" height="24" aria-hidden="true" focusable="false" fill="none" viewBox="0 0 24 24">
                  {position === "left" ? (
                    <path d="M14.7 6.29a1 1 0 1 0-1.4 1.42L16.59 11H7a1 1 0 1 0 0 2h9.59l-3.3 3.29a1 1 0 0 0 1.42 1.42l5-5a1 1 0 0 0 0-1.42l-5-5z" fill="#3b82f6" />
                  ) : (
                    <path d="M9.3 17.71a1 1 0 1 1 1.4-1.42L7.41 13H17a1 1 0 1 1 0-2H7.41l3.3-3.29a1 1 0 0 1-1.42-1.42l-5 5a1 1 0 0 1 0 1.42l5 5z" fill="#3b82f6" />
                  )}
                </svg>
              )}</span>
            </button>
          </div>
          {/* Menu items */}
          <nav className="sidebar__nav" aria-label={navAriaLabel}>
            <ul className="sidebar__list">
              {items.map((item, i) => (
                <li key={item.key} className="sidebar__item">
                  {item.href ? (
                    <a
                      className={
                        [
                          "sidebar__link",
                          item.key === selectedKey ? "sidebar__link--active" : "",
                        ].filter(Boolean).join(" ")
                      }
                      href={item.href}
                      aria-current={item.key === selectedKey ? "page" : undefined}
                      tabIndex={0}
                      onClick={(e) => {
                        if (item.onClick) e.preventDefault();
                        onItemClick(item);
                      }}
                      {...(item.onClick ? { role: "button" } : {})}
                    >
                      {item.icon && <span className="sidebar__icon" aria-hidden="true">{item.icon}</span>}
                      <span className="sidebar__label">{item.label}</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      className={
                        [
                          "sidebar__link",
                          item.key === selectedKey ? "sidebar__link--active" : "",
                        ].filter(Boolean).join(" ")
                      }
                      tabIndex={0}
                      onClick={() => onItemClick(item)}
                      aria-current={item.key === selectedKey ? "page" : undefined}
                    >
                      {item.icon && <span className="sidebar__icon" aria-hidden="true">{item.icon}</span>}
                      <span className="sidebar__label">{item.label}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          {/* Footer slot (optional) */}
          {footer && <div className="sidebar__footer">{footer}</div>}
        </div>
      </aside>
    );

    // If overlay, wrap in backdrop
    if (isOverlay) {
      return (
        <>
          {/* Toggle FAB if sidebar is closed */}
          {!isOpen && (
            <button
              className={
                [
                  "sidebar__fab",
                  position === "right" ? "sidebar__fab--right" : "",
                ].filter(Boolean).join(" ")
              }
              type="button"
              aria-label="Open menu"
              aria-haspopup="true"
              aria-controls="sidebar"
              onClick={() => handleToggle(true)}
              tabIndex={0}
            >
              <svg width="28" height="28" aria-hidden="true" fill="none" viewBox="0 0 26 26">
                <rect y="6" width="20" height="2.5" rx="1.25" fill="#3b82f6" />
                <rect y="12" width="14" height="2.5" rx="1.25" fill="#3b82f6" />
                <rect y="18" width="17" height="2.5" rx="1.25" fill="#3b82f6" />
              </svg>
            </button>
          )}
          {isOpen && (
            <div
              className="sidebar__backdrop"
              role="presentation"
              tabIndex={-1}
              onMouseDown={handleBackdrop}
            >
              {SidebarBody}
            </div>
          )}
        </>
      );
    }
    // Docked mode
    return SidebarBody;
  }
);

export default Sidebar;
