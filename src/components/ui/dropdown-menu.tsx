"use client";

import * as React from "react";
import {
  Dropdown as HeroDropdown,
  Separator as HeroSeparator,
  Header as HeroHeader,
} from "@heroui/react";
import { cn } from "@/lib/utils";

// DropdownMenu Root
export function DropdownMenu({ children, ...props }: React.ComponentProps<typeof HeroDropdown>) {
  return <HeroDropdown {...props}>{children}</HeroDropdown>;
}

// DropdownMenuPortal
export function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <React.Fragment>{children}</React.Fragment>;
}

// DropdownMenuTrigger
export interface DropdownMenuTriggerProps extends React.ComponentProps<typeof HeroDropdown.Trigger> {
  asChild?: boolean;
}

export function DropdownMenuTrigger({ children, ...props }: DropdownMenuTriggerProps) {
  const cleanProps = { ...props };
  delete cleanProps.asChild;
  return <HeroDropdown.Trigger {...cleanProps}>{children}</HeroDropdown.Trigger>;
}

// DropdownMenuContent
export interface DropdownMenuContentProps extends Omit<React.ComponentProps<typeof HeroDropdown.Popover>, "children"> {
  children?: React.ReactNode;
  align?: "start" | "end" | "center";
  sideOffset?: number;
}

export function DropdownMenuContent({
  children,
  className,
  align = "start",
  sideOffset = 4,
  ...props
}: DropdownMenuContentProps) {
  const placement = align === "end" ? "bottom end" : align === "center" ? "bottom" : "bottom start";
  return (
    <HeroDropdown.Popover
      placement={placement}
      offset={sideOffset}
      className={cn(
        "z-50 min-w-32 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95",
        className
      )}
      {...props}
    >
      <HeroDropdown.Menu className="outline-none flex flex-col gap-0.5">
        {children as React.ComponentProps<typeof HeroDropdown.Menu>["children"]}
      </HeroDropdown.Menu>
    </HeroDropdown.Popover>
  );
}

// DropdownMenuGroup
export function DropdownMenuGroup({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>;
}

// DropdownMenuItem
export interface DropdownMenuItemProps extends Omit<React.ComponentProps<typeof HeroDropdown.Item>, "children" | "variant"> {
  children?: React.ReactNode;
  variant?: "default" | "destructive";
  inset?: boolean;
}

// Utility to extract text content from React children for accessibility typeahead support
function getReactText(node: React.ReactNode): string {
  if (!node) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getReactText).join("");
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    return getReactText(el.props.children);
  }
  return "";
}

export function DropdownMenuItem({
  children,
  className,
  variant = "default",
  inset,
  onClick,
  ...props
}: DropdownMenuItemProps) {
  const textValue = typeof children === "string" ? children : getReactText(children);
  return (
    <HeroDropdown.Item
      onClick={onClick}
      className={cn(
        "group/menu-item relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs outline-none select-none text-foreground hover:bg-accent hover:text-accent-foreground data-[hovered]:bg-accent data-[hovered]:text-accent-foreground data-[focus]:bg-accent data-[focus]:text-accent-foreground transition-colors",
        variant === "destructive" && "text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 focus:bg-destructive/10 focus:text-destructive",
        inset && "pl-8",
        className
      )}
      variant={variant === "destructive" ? "danger" : "default"}
      textValue={textValue}
      {...props}
    >
      {children}
    </HeroDropdown.Item>
  );
}

// DropdownMenuSeparator
export type DropdownMenuSeparatorProps = React.ComponentProps<typeof HeroSeparator>;

export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    <HeroSeparator
      className={cn("-mx-1 my-1 border-t border-border/40", className)}
      {...props}
    />
  );
}

// DropdownMenuLabel
export type DropdownMenuLabelProps = React.ComponentProps<typeof HeroHeader>;

export function DropdownMenuLabel({ children, className, ...props }: DropdownMenuLabelProps) {
  return (
    <HeroHeader
      className={cn("px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60", className)}
      {...props}
    >
      {children}
    </HeroHeader>
  );
}

// DropdownMenuShortcut
export function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  );
}

// Stub components for compatibility with unused shadcn dropdown exports
export interface DropdownMenuCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
}
export function DropdownMenuCheckboxItem({ children, ...props }: DropdownMenuCheckboxItemProps) {
  const cleanProps = { ...props };
  delete cleanProps.checked;
  return <div {...cleanProps}>{children}</div>;
}

export interface DropdownMenuRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
}
export function DropdownMenuRadioGroup({ children, ...props }: DropdownMenuRadioGroupProps) {
  const cleanProps = { ...props };
  delete cleanProps.value;
  return <div {...cleanProps}>{children}</div>;
}

export interface DropdownMenuRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
}
export function DropdownMenuRadioItem({ children, ...props }: DropdownMenuRadioItemProps) {
  const cleanProps = { ...props };
  delete cleanProps.value;
  return <div {...cleanProps}>{children}</div>;
}

export interface DropdownMenuSubProps {
  children?: React.ReactNode;
}
export function DropdownMenuSub({ children }: DropdownMenuSubProps) {
  return <React.Fragment>{children}</React.Fragment>;
}

export type DropdownMenuSubTriggerProps = React.HTMLAttributes<HTMLDivElement>;
export function DropdownMenuSubTrigger({ children, ...props }: DropdownMenuSubTriggerProps) {
  return <div {...props}>{children}</div>;
}

export type DropdownMenuSubContentProps = React.HTMLAttributes<HTMLDivElement>;
export function DropdownMenuSubContent({ children, ...props }: DropdownMenuSubContentProps) {
  return <div {...props}>{children}</div>;
}
