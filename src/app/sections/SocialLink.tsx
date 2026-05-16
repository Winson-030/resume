import * as React from "react";
import Link from "next/link";

interface SocialLinkProps {
  href: string;
  icon: React.ElementType;
  ariaLabel: string;
  className?: string;
}

export function SocialLink({ href, icon: Icon, ariaLabel, className = "" }: SocialLinkProps) {
  return (
    <Link
      key={href}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full focus-visible:outline-none ${className}`}
      aria-label={ariaLabel}
    >
      <div className="w-12 h-12 border border-foreground/10 flex items-center justify-center hover:border-foreground/30 transition-colors">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
    </Link>
  );
}
