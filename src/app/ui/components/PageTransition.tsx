"use client";

import type { CSSProperties, ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    // Opacity-only on purpose: this wrapper contains the fixed navbar, the
    // mobile drawer and the background canvases. A transform here would make
    // it their containing block and unpin every one of them.
    <div
      className="reveal-fade"
      style={{ "--reveal-duration": "400ms" } as CSSProperties}
    >
      {children}
    </div>
  );
}
