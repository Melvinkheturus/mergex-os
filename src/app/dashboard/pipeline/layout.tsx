import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pipeline",
  description: "Visual sales pipeline board — manage leads through every stage from generation to close.",
};

export default function PipelineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
