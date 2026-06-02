import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspaces | MergeX OS",
  description: "Choose your brand workspace to get started.",
};

export default function WorkspacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden">
      {children}
    </div>
  );
}
