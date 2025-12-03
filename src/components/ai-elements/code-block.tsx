"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

type CodeBlockContextType = {
  code: string;
};

const CodeBlockContext = createContext<CodeBlockContextType>({
  code: "",
});

export type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  children?: ReactNode;
};

export const CodeBlock = ({
  code,
  language,
  showLineNumbers = false,
  className,
  children,
  ...props
}: CodeBlockProps) => (
  <CodeBlockContext.Provider value={{ code }}>
    <PlainCodeBlock
      code={code}
      language={language}
      showLineNumbers={showLineNumbers}
      className={className}
      {...props}
    >
      {children}
    </PlainCodeBlock>
  </CodeBlockContext.Provider>
);

type PlainCodeBlockProps = CodeBlockProps;

const PlainCodeBlock = ({
  code,
  language,
  showLineNumbers,
  className,
  children,
  ...props
}: PlainCodeBlockProps) => {
  const lines = useMemo(() => code.split("\n"), [code]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-md border bg-background text-foreground",
        className
      )}
      {...props}
    >
      <div className="relative flex text-sm">
        {showLineNumbers && (
          <div className="select-none bg-muted/60 px-3 py-3 text-xs text-muted-foreground">
            {lines.map((_, idx) => (
              <div key={idx} className="leading-6 tabular-nums">
                {idx + 1}
              </div>
            ))}
          </div>
        )}
        <pre className="w-full overflow-auto px-4 py-3 font-mono text-[13px] leading-6">
          <code data-language={language}>{code}</code>
        </pre>
        {children && (
          <div className="absolute top-2 right-2 flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const CodeBlockCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: CodeBlockCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { code } = useContext(CodeBlockContext);

  const copyToClipboard = async () => {
    if (typeof window === "undefined" || !navigator.clipboard.writeText) {
      onError?.(new Error("Clipboard API not available"));
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      onCopy?.();
      setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      className={cn("shrink-0", className)}
      onClick={copyToClipboard}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon size={14} />}
    </Button>
  );
};
