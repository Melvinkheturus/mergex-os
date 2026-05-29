"use client";

import { useState } from "react";
import { SettingsSidebar } from "./settings-sidebar";
import { SettingsWorkspaceHeader } from "./settings-workspace-header";

interface SettingsClientLayoutProps {
  roleName?: string;
  children: React.ReactNode;
}

export function SettingsClientLayout({ roleName, children }: SettingsClientLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-transparent h-screen">
      {/* Settings Navigation Sidebar */}
      <SettingsSidebar 
        roleName={roleName} 
        collapsed={collapsed} 
        onCollapse={(val) => setCollapsed(val)} 
      />

      {/* Settings Active Section Content Workspace (Glassmorphism Layout) */}
      <div className="flex-grow flex flex-col p-3 lg:p-4 overflow-hidden h-full">
        <div className="flex-1 glass-frost-card rounded-2xl shadow-lg flex flex-col overflow-hidden">
          <SettingsWorkspaceHeader />
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-4xl mx-auto w-full space-y-8 text-left pb-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
