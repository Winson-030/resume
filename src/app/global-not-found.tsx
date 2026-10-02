import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f1efea", color: "#111111", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 2rem", maxWidth: "40rem", margin: "0 auto" }}>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, margin: 0 }}>Winson</p>
          <h1 style={{ fontSize: "3rem", margin: "1rem 0 0.5rem" }}>404</h1>
          <p style={{ fontSize: "1rem", opacity: 0.7, margin: "0 0 2rem" }}>Page not found.</p>
          <Link href="/en" style={{ color: "#111111", fontSize: "0.875rem" }}>Go to homepage -&gt;</Link>
        </main>
      </body>
    </html>
  );
}
