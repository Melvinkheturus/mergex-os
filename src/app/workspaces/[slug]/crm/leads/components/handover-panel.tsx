"use client";

import { UserCheck, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { OptionUser } from "./types";

interface HandoverPanelProps {
  owners: OptionUser[];
  handoverEM: string;
  setHandoverEM: (em: string) => void;
  converting: boolean;
  onConvert: () => Promise<void>;
}

export function HandoverPanel({
  owners,
  handoverEM,
  setHandoverEM,
  converting,
  onConvert,
}: HandoverPanelProps) {
  return (
    <Card className="border border-emerald-500/30 shadow-sm rounded-2xl bg-emerald-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-emerald-600 flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Client Handover
        </CardTitle>
        <p className="text-xs text-muted-foreground">Convert this won lead to an active client record.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Engagement Manager
          </Label>
          <Select value={handoverEM} onValueChange={setHandoverEM}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Assign EM" />
            </SelectTrigger>
            <SelectContent>
              {owners.map((ow) => (
                <SelectItem key={ow.id} value={ow.id}>
                  {ow.firstName} {ow.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          onClick={onConvert}
          disabled={!handoverEM || converting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
        >
          {converting ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
          )}
          Convert to Client
        </Button>
      </CardContent>
    </Card>
  );
}
