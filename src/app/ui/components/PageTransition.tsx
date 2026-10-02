"use client";

import type { CSSProperties, ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <div
      className="reveal"
      style={{ "--reveal-duration": "400ms", "--reveal-y": "20px" } as CSSProperties}
    >
      {children}
    </div>
  );
}
