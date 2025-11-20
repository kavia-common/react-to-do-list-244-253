import React from "react";
import "./Button.css";

/**
 * PUBLIC_INTERFACE
 * Button component supporting variants, sizes, disabled, loading,
 * accessible focus, and custom classes.
 *
 * Props:
 * - children: ReactNode (button label/contents)
 * - onClick: function
 * - type: 'button' | 'submit' | 'reset'
 * - variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * - size: 'sm' | 'md' | 'lg'
 * - disabled: boolean
 * - loading: boolean
 * - className: string (extra CSS classes)
 * - aria-label: string (accessibility)
 */
const VARIANT_CLASSES = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger"
};
const SIZE_CLASSES = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg"
};

// PUBLIC_INTERFACE
const Button = React.forwardRef(
  (
    {
      children,
      onClick,
      type = "button",
      variant = "primary",
      size = "md",
      disabled = false,
      loading = false,
      className = "",
      "aria-label": ariaLabel,
      ...restProps
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={type}
        className={[
          "kavia-btn",
          VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary,
          SIZE_CLASSES[size] || SIZE_CLASSES.md,
          isDisabled ? "btn-disabled" : "",
          loading ? "btn-loading" : "",
          className
        ].join(" ")}
        onClick={onClick}
        disabled={isDisabled}
        aria-busy={loading ? "true" : undefined}
        aria-label={ariaLabel}
        tabIndex={0}
        {...restProps}
      >
        {loading ? (
          <span className="btn-spinner" aria-hidden="true"></span>
        ) : null}
        <span className={loading ? "btn-content-fade" : ""}>
          {children}
        </span>
      </button>
    );
  }
);

export default Button;
