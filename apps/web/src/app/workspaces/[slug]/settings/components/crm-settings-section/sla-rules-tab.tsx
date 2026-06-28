"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export function SlaRulesTab({
  settings,
  updateLead,
  updateSales
}: {
  settings: any;
  updateLead: any;
  updateSales: any;
}) {
  return (
    <div className="space-y-6">
      {settings.slaEnabled === false && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-left text-xs font-semibold text-red-600 dark:text-red-400">
          ⚠️ The SLA System is globally disabled. The active rules below will not be monitored or enforced across the platform.
        </div>
      )}
      
      {/* Lead Operations Table */}
      <Card className="glass-frost-card border border-border/20 rounded-[20px] shadow-sm">
        <CardHeader className="text-left pb-3">
          <CardTitle className="text-sm font-bold text-foreground">Lead Operations SLAs</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Define target response and completion times for incoming leads and initial triage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-border/20 rounded-xl overflow-hidden bg-card text-left">
            <Table>
              <TableHeader className="bg-muted/5">
                <TableRow>
                  <TableHead className="text-xs font-bold text-muted-foreground">Stage</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground w-32">Duration</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground w-36">Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.leadSlas.map((sla: any, idx: number) => (
                  <TableRow key={sla.stage} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="text-xs font-semibold text-foreground py-3.5">
                      {sla.stage}
                    </TableCell>
                    <TableCell className="py-2">
                      <Input
                        type="number"
                        min={1}
                        value={sla.duration}
                        onChange={(e) => updateLead(idx, "duration", parseInt(e.target.value) || 1)}
                        className="h-8.5 w-24 text-xs font-semibold bg-background"
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <select
                        value={sla.unit}
                        onChange={(e) => updateLead(idx, "unit", e.target.value)}
                        className="w-full h-8.5 px-3 text-xs bg-background border border-border/30 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/30 cursor-pointer font-semibold"
                      >
                        <option value="Hours">Hours</option>
                        <option value="Days">Days</option>
                      </select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sales Conversion Table */}
      <Card className="glass-frost-card border border-border/20 rounded-[20px] shadow-sm">
        <CardHeader className="text-left pb-3">
          <CardTitle className="text-sm font-bold text-foreground">Sales Conversion SLAs</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Configure target durations for opportunity qualification, negotiation, and closure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-border/20 rounded-xl overflow-hidden bg-card text-left">
            <Table>
              <TableHeader className="bg-muted/5">
                <TableRow>
                  <TableHead className="text-xs font-bold text-muted-foreground">Stage</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground w-32">Duration</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground w-36">Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.salesSlas.map((sla: any, idx: number) => (
                  <TableRow key={sla.stage} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="text-xs font-semibold text-foreground py-3.5">
                      {sla.stage}
                    </TableCell>
                    <TableCell className="py-2">
                      <Input
                        type="number"
                        min={1}
                        value={sla.duration}
                        onChange={(e) => updateSales(idx, "duration", parseInt(e.target.value) || 1)}
                        className="h-8.5 w-24 text-xs font-semibold bg-background"
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <select
                        value={sla.unit}
                        onChange={(e) => updateSales(idx, "unit", e.target.value)}
                        className="w-full h-8.5 px-3 text-xs bg-background border border-border/30 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/30 cursor-pointer font-semibold"
                      >
                        <option value="Hours">Hours</option>
                        <option value="Days">Days</option>
                      </select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
