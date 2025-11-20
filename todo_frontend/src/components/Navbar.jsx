import React from "react";
import "./Navbar.css";

/**
 * PUBLIC_INTERFACE
 * Navbar component for the Todo app.
 *
 * Props:
 * - title (string): Main brand/title (default: "Todo")
 * - children (React.ReactNode): Right-aligned content (button/links etc.)
 * - as (string|React.Component): Polymorphic root container, defaults to 'header'
 * - className (string): Extra class names
 * - onTitleClick (function): Click handler for the title brand
 *
 * Accessibility:
 * - Uses <header> and <nav> with aria-label, focus states, proper color contrast.
 * - Keyboard accessible title if clickable (renders button if handler present).
 */

const Navbar = ({
  title = "Todo",
  children,
  as: RootEl = "header",
  className = "",
  onTitleClick,
  ...rest
}) => {
  // Compose main container
  const rootClass = ["navbar", className].filter(Boolean).join(" ");

  return (
    <RootEl className={rootClass} {...rest}>
      <nav className="navbar-nav" aria-label="Main navigation">
        <div className="navbar-brand">
          {onTitleClick ? (
            <button
              className="navbar-title navbar-title-btn"
              type="button"
              tabIndex={0}
              onClick={onTitleClick}
              aria-label="Go to home"
            >
              {title}
            </button>
          ) : (
            <span className="navbar-title">{title}</span>
          )}
        </div>
        <div className="navbar-actions">
          {children}
        </div>
      </nav>
    </RootEl>
  );
};

export default Navbar;
