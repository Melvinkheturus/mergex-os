"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CommandCenter } from "./command-center";

interface CommandContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const CommandContext = createContext<CommandContextValue>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
});

export function useCommandCenter() {
  return useContext(CommandContext);
}

export function CommandProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  return (
    <CommandContext.Provider value={{ open, setOpen, toggle }}>
      {children}
      <CommandCenter open={open} onOpenChange={setOpen} />
    </CommandContext.Provider>
  );
}
