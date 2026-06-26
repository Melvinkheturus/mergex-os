import { RefreshCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ReloadButtonProps {
  onClick: () => void;
  tooltipText?: string;
  className?: string;
}

export function ReloadButton({
  onClick,
  tooltipText = "Force reload from server",
  className = "p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-white/5 transition-all cursor-pointer"
}: ReloadButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={className}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
