import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

/**
 * VisuallyHidden component for accessibility (Radix style)
 */
export const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ style, ...props }, ref) => (
  <span
    ref={ref}
    style={{
      border: 0,
      clip: "rect(0 0 0 0)",
      height: "1px",
      margin: "-1px",
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      width: "1px",
      whiteSpace: "nowrap",
      ...style,
    }}
    {...props}
  />
));
VisuallyHidden.displayName = "VisuallyHidden";
