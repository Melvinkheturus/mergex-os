"use client";

import * as React from "react";
import {
  Select as HeroSelect,
  ListBox as HeroListBox,
  ListBoxItem as HeroListBoxItem,
  ListBoxItemIndicator as HeroListBoxItemIndicator,
} from "@heroui/react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, CheckIcon } from "lucide-react";

const SelectPlaceholderContext = React.createContext<{
  placeholder?: string;
  setPlaceholder?: (p: string) => void;
}>({});

export interface SelectProps extends Omit<React.ComponentProps<typeof HeroSelect>, "children" | "isDisabled"> {
  children?: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  isDisabled?: boolean;
}

export function Select({
  children,
  value,
  onValueChange,
  disabled,
  isDisabled,
  ...props
}: SelectProps) {
  const [placeholder, setPlaceholder] = React.useState<string | undefined>(undefined);

  const handleSelectionChange = (key: React.Key | null) => {
    if (onValueChange && key !== null) {
      onValueChange(String(key));
    }
  };

  return (
    <SelectPlaceholderContext.Provider value={{ placeholder, setPlaceholder }}>
      <HeroSelect
        selectedKey={value === "" ? undefined : value}
        onSelectionChange={handleSelectionChange}
        placeholder={placeholder}
        isDisabled={disabled || isDisabled}
        {...props}
      >
        {children as React.ComponentProps<typeof HeroSelect>["children"]}
      </HeroSelect>
    </SelectPlaceholderContext.Provider>
  );
}

export interface SelectTriggerProps extends Omit<React.ComponentProps<typeof HeroSelect.Trigger>, "children"> {
  children?: React.ReactNode;
  size?: "default" | "sm";
}

export function SelectTrigger({
  children,
  className,
  size = "default",
  ...props
}: SelectTriggerProps) {
  return (
    <HeroSelect.Trigger
      className={cn(
        "flex w-full items-center justify-between gap-1.5 rounded-lg border border-border/80 bg-white dark:bg-[#050507] py-2 px-3 text-sm transition-colors outline-none focus:ring-1 focus:ring-[#8B5CF6]/30 focus:border-[#8B5CF6]/40 text-foreground shadow-2xs data-[placeholder=true]:text-muted-foreground",
        size === "sm" && "h-8 py-1 text-xs",
        className
      )}
      {...props}
    >
      {children}
      <HeroSelect.Indicator>
        <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
      </HeroSelect.Indicator>
    </HeroSelect.Trigger>
  );
}

export interface SelectValueProps extends React.ComponentProps<typeof HeroSelect.Value> {
  placeholder?: string;
}

export function SelectValue({
  placeholder,
  className,
  ...props
}: SelectValueProps) {
  const { setPlaceholder } = React.useContext(SelectPlaceholderContext);

  React.useEffect(() => {
    if (placeholder && setPlaceholder) {
      setPlaceholder(placeholder);
    }
  }, [placeholder, setPlaceholder]);

  return (
    <HeroSelect.Value className={cn("text-sm", className)} {...props} />
  );
}

export interface SelectContentProps extends Omit<React.ComponentProps<typeof HeroSelect.Popover>, "children"> {
  children?: React.ReactNode;
}

export function SelectContent({
  children,
  className,
  ...props
}: SelectContentProps) {
  return (
    <HeroSelect.Popover
      className={cn(
        "z-50 min-w-36 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95",
        className
      )}
      {...props}
    >
      <HeroListBox className="outline-none flex flex-col gap-0.5">
        {children as React.ComponentProps<typeof HeroListBox>["children"]}
      </HeroListBox>
    </HeroSelect.Popover>
  );
}

export interface SelectItemProps extends Omit<React.ComponentProps<typeof HeroListBoxItem>, "children" | "id" | "value"> {
  children?: React.ReactNode;
  value: string;
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

export function SelectItem({
  children,
  className,
  value,
  ...props
}: SelectItemProps) {
  const textValue = typeof children === "string" ? children : getReactText(children);
  return (
    <HeroListBoxItem
      id={value}
      textValue={textValue}
      className={cn(
        "group/select-item relative flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 pr-8 text-xs outline-none select-none text-foreground hover:bg-accent hover:text-accent-foreground data-[hovered]:bg-accent data-[hovered]:text-accent-foreground data-[focus]:bg-accent data-[focus]:text-accent-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground transition-colors",
        className
      )}
      {...props}
    >
      {children}
      <HeroListBoxItemIndicator className="absolute right-2 flex size-4 items-center justify-center text-foreground">
        <CheckIcon className="h-3.5 w-3.5" />
      </HeroListBoxItemIndicator>
    </HeroListBoxItem>
  );
}

// Stubs for remaining unused exports to maintain 100% API compatibility
export type SelectGroupProps = React.HTMLAttributes<HTMLDivElement>;
export function SelectGroup({ children, ...props }: SelectGroupProps) {
  return <div {...props}>{children}</div>;
}

export type SelectLabelProps = React.HTMLAttributes<HTMLDivElement>;
export function SelectLabel({ children, ...props }: SelectLabelProps) {
  return <div {...props}>{children}</div>;
}

export type SelectScrollUpButtonProps = React.HTMLAttributes<HTMLDivElement>;
export function SelectScrollUpButton({ ...props }: SelectScrollUpButtonProps) {
  return <div {...props} />;
}

export type SelectScrollDownButtonProps = React.HTMLAttributes<HTMLDivElement>;
export function SelectScrollDownButton({ ...props }: SelectScrollDownButtonProps) {
  return <div {...props} />;
}

export type SelectSeparatorProps = React.HTMLAttributes<HTMLHRElement>;
export function SelectSeparator({ ...props }: SelectSeparatorProps) {
  return <hr className="my-1 border-t border-border/40" {...props} />;
}
