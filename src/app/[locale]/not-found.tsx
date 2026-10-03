import Link from "next/link";

// not-found.tsx does not receive route params in Next 16, so keep this
// language-neutral and link to every locale instead.
const links = [
  { href: "/en", label: "English" },
  { href: "/zh", label: "中文" },
  { href: "/ja", label: "日本語" },
];

export default function LocaleNotFound() {
  return (
    <main className="min-h-screen flex flex-col justify-center max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
      <p className="font-mono-alt text-xs tracking-[0.12em] uppercase text-muted-foreground">404</p>
      <h1 className="h-xl mt-4">
        Page not found / 页面不存在 / ページが見つかりません
      </h1>
      <nav className="mt-8 flex flex-wrap gap-6 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="underline underline-offset-4 opacity-70 hover:opacity-100 transition-opacity"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
