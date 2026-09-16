import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  disableWheelAdjustment?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, disableWheelAdjustment = true, onWheel, ...props }, ref) => {
    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
      if (props.type === "number" && disableWheelAdjustment !== false) {
        if (!e.currentTarget.closest("[data-allow-wheel-adjustment='true']")) {
          e.currentTarget.blur();
        }
      }
      onWheel?.(e);
    };

    return (
      <input
        className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors
          ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          }
          ${className}`}
        ref={ref}
        onWheel={handleWheel}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
