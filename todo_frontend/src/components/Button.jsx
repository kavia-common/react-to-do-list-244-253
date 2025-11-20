import React from "react";
import "./Button.css";

/**
 * PUBLIC_INTERFACE
 * @typedef {'primary'|'neutral'|'danger'|'success'} Tone
 * @typedef {'solid'|'soft'|'outline'|'ghost'} Weight
 * @typedef {'sm'|'md'|'lg'} Size
 */

/**
 * PUBLIC_INTERFACE
 * Button component (proseful, polymorphic API).
 *
 * Polymorphic via `as` (default 'button'). Accepts:
 * - tone: 'primary'|'neutral'|'danger'|'success' (semantic color intent)
 * - weight: 'solid'|'soft'|'outline'|'ghost' (visual style)
 * - size: 'sm'|'md'|'lg'
 * - fullWidth: boolean
 * - disabled, loading, type, onClick, aria-label, className
 * - leading: React node for icon/element before label
 * - trailing: React node for icon/element after label
 * - variant: (deprecated) supports old style guide values (maps to new {tone, weight})
 * - Remaining props are spread onto container (aria, href, etc.)
 *
 * Example:
 *   <Button tone="primary" weight="solid" size="lg" leading={<Icon />} fullWidth>
 *     Save changes
 *   </Button>
 */
const TONE_TO_COLOR = {
  primary: "btn-primary",
  neutral: "btn-secondary", // style: secondary surface
  danger: "btn-danger",
  success: "btn-success"
};
const TONE_TO_DEFAULT_WEIGHT = {
  primary: "solid",
  neutral: "outline",
  danger: "solid",
  success: "solid"
};
const WEIGHT_CLASS = {
  solid: "",
  outline: "btn-secondary",
  ghost: "btn-ghost",
  soft: "btn-secondary" // visual style is like outline (for neutral)
};
const SIZE_CLASSES = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg"
};
// Legacy variant mapping
const VARIANT_LEGACY_MAP = {
  primary: { tone: "primary", weight: "solid" },
  secondary: { tone: "neutral", weight: "outline" },
  ghost: { tone: "primary", weight: "ghost" },
  danger: { tone: "danger", weight: "solid" }
};

/** Returns appropriate CSS class for tone+weight combo. */
function getButtonClass({ tone, weight }) {
  if (tone === "success") return "btn-primary"; // no unique style, use primary blue
  if (weight === "ghost") return "btn-ghost";
  if (tone === "neutral" && (weight === "soft" || weight === "outline")) return "btn-secondary";
  if (tone === "danger") return "btn-danger";
  if (tone === "primary" && (weight === "solid" || !weight)) return "btn-primary";
  if (tone === "neutral" && weight === "solid") return "btn-secondary";
  if (weight === "outline") return "btn-secondary";
  return "btn-primary"; // fallback
}

/**
 * Button
 * @param {object} props
 * @param {React.ReactNode} [props.children] - Visible button label/contents.
 * @param {Tone} [props.tone='primary'] - Semantic intent ('primary'|'neutral'|'danger'|'success').
 * @param {Weight} [props.weight] - Visual style ('solid'|'soft'|'outline'|'ghost'). Defaults as per tone.
 * @param {Size} [props.size='md'] - Button size.
 * @param {boolean} [props.fullWidth] - Makes button take full container width.
 * @param {boolean} [props.disabled] - Disabled state (blocks interaction).
 * @param {boolean} [props.loading] - Loading/spinner state (aria-busy/blocks action).
 * @param {'button'|'submit'|'reset'} [props.type] - HTML type (only applies if rendered as <button>).
 * @param {function} [props.onClick] - Click handler.
 * @param {string} [props.className] - Extra CSS classes.
 * @param {string} [props['aria-label']] - Accessible label.
 * @param {any} [props.leading] - React node for icon/element before label.
 * @param {any} [props.trailing] - React node for icon/element after label.
 * @param {string} [props.variant] - Legacy API; maps to new {tone, weight}.
 * @param {string|function} [props.as] - Element type ('button', 'a', etc).
 * @param {object} [props.style] - Inline style.
 * @param {object} [restProps] - Props spread onto component.
 */
const Button = React.forwardRef(
  (
    {
      children,
      tone,
      weight,
      size = "md",
      fullWidth = false,
      disabled = false,
      loading = false,
      type = "button",
      onClick,
      className = "",
      "aria-label": ariaLabel,
      leading,
      trailing,
      variant, // legacy
      as,
      style,
      ...rest
    },
    ref
  ) => {
    // Backwards compatibility shim
    let resolvedTone = tone;
    let resolvedWeight = weight;
    if (variant && VARIANT_LEGACY_MAP[variant]) {
      resolvedTone = TONE_TO_COLOR[VARIANT_LEGACY_MAP[variant].tone] ? VARIANT_LEGACY_MAP[variant].tone : (tone || "primary");
      resolvedWeight = VARIANT_LEGACY_MAP[variant].weight;
    } else {
      resolvedTone = tone || "primary";
      resolvedWeight = weight || TONE_TO_DEFAULT_WEIGHT[resolvedTone] || "solid";
    }

    // For hostile disables
    const isDisabled = !!(disabled || loading);
    const showSpinner = !!loading;

    // Dynamic element: <button> (default), <a>, or custom (polymorphic)
    const Component = as || "button";
    const isButtonTag = Component === "button";

    // Compose className
    const classes = [
      "kavia-btn",
      getButtonClass({ tone: resolvedTone, weight: resolvedWeight }),
      SIZE_CLASSES[size] || SIZE_CLASSES.md,
      fullWidth ? "kavia-btn-fullwidth" : "",
      isDisabled ? "btn-disabled" : "",
      showSpinner ? "btn-loading" : "",
      className
    ]
      .filter(Boolean)
      .join(" ");

    // Block action if loading/disabled
    const handleClick = (e) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    // Props for <button> and <a>
    const commonProps = {
      ref,
      className: classes,
      onClick: handleClick,
      "aria-busy": showSpinner ? "true" : undefined,
      "aria-disabled": isDisabled ? "true" : undefined,
      "aria-label": ariaLabel,
      tabIndex: 0,
      style,
      ...rest
    };

    // Accessibility:
    // - <button>: disabled
    // - <a>: aria-disabled
    // - keyboard interaction for both with tabIndex
    if (isButtonTag) {
      commonProps.type = type;
      commonProps.disabled = isDisabled;
    } else if (Component === "a" && isDisabled) {
      commonProps.tabIndex = -1;
      commonProps.href = undefined; // Do not allow navigation
      commonProps.onClick = (e) => e.preventDefault();
    }

    return (
      <Component {...commonProps}>
        {leading ? (
          <span style={{ display: "inline-flex", marginRight: children ? ".55em" : 0, alignItems: "center" }}>
            {showSpinner ? (
              <span className="btn-spinner" aria-hidden="true" />
            ) : (
              leading
            )}
          </span>
        ) : showSpinner ? (
          <span className="btn-spinner" aria-hidden="true" style={{ marginRight: children ? ".55em" : 0 }} />
        ) : null}
        {/* Ensure label is centered with icons */}
        {children ? (
          <span className={showSpinner ? "btn-content-fade" : ""}>{children}</span>
        ) : null}
        {trailing && (
          <span style={{ display: "inline-flex", marginLeft: children ? ".55em" : 0, alignItems: "center" }}>
            {trailing}
          </span>
        )}
      </Component>
    );
  }
);

export default Button;
