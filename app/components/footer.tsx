import Link from "next/link";

export default function Footer() {
  return (
    <footer className="content-footer">
      <span>Domus</span>
      <span className="content-footer-separator">·</span>
      <span>© {new Date().getFullYear()}</span>
      <span className="content-footer-separator">·</span>
      <span><Link href="/about">Sobre Domus</Link></span>
      <span className="content-footer-separator">·</span>
      <span>by <Link href="https://mahg.me" target="_blank">MAHG</Link></span>
    </footer>
  );
}
