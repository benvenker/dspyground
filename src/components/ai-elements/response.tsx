"use client";

import { cn } from "@/lib/utils";
import { memo } from "react";

type ResponseProps = {
  className?: string;
  children: string | (string | JSX.Element)[];
};

// Escape HTML-like tags so user prompts don't render as elements (e.g., <context>, <prompt>)
const sanitize = (value: ResponseProps["children"]) => {
  if (typeof value === "string") {
    return value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  if (Array.isArray(value)) {
    return value.map((item) =>
      typeof item === "string"
        ? item.replace(/</g, "&lt;").replace(/>/g, "&gt;")
        : item
    );
  }
  return value;
};

export const Response = memo(
  ({ className, children }: ResponseProps) => {
    const safe = sanitize(children);

    if (Array.isArray(safe)) {
      return (
        <div className={cn("space-y-2", className)}>
          {safe.map((part, idx) =>
            typeof part === "string" ? (
              <p
                key={idx}
                className="whitespace-pre-wrap leading-relaxed break-words"
                dangerouslySetInnerHTML={{ __html: part }}
              />
            ) : (
              <div key={idx} className="leading-relaxed">
                {part}
              </div>
            )
          )}
        </div>
      );
    }

    return (
      <p
        className={cn(
          "whitespace-pre-wrap leading-relaxed break-words",
          className
        )}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
