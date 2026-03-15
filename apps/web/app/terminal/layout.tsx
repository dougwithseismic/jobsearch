import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Doug Silkstone — CV",
  description:
    "Lead Full Stack Software Engineer · 15+ years · 3 exits · Prague, CZ",
};

export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
