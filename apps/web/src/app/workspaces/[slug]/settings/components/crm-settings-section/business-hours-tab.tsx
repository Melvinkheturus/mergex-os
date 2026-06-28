"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function BusinessHoursTab({ settings, update }: { settings: any; update: any }) {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const timezoneOptions = [
    "Asia/Kolkata",
    "UTC",
    "Asia/Singapore",
    "Europe/London",
    "US/Eastern",
    "US/Pacific",
  ];

  const handleDayToggle = (day: string) => {
    const activeDays = [...settings.businessHours.days];
    if (activeDays.includes(day)) {
      update("days", activeDays.filter((d: string) => d !== day));
    } else {
      update("days", [...activeDays, day]);
    }
  };

  return (
    <Card className="glass-frost-card border border-border/20 rounded-[20px] shadow-sm">
      <CardHeader className="text-left pb-4">
        <CardTitle className="text-sm font-bold text-foreground">Business Hours</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Define working days, hours, and timezone to prevent SLA breaches outside of business hours.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Operating Hours & Timezone */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Start Time</Label>
            <input
              type="time"
              value={settings.businessHours.startTime.includes("M") ? "09:00" : settings.businessHours.startTime}
              onChange={(e) => update("startTime", e.target.value)}
              className="w-full h-9 px-3 text-xs bg-background border border-border/30 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/30 cursor-pointer font-semibold"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">End Time</Label>
            <input
              type="time"
              value={settings.businessHours.endTime.includes("M") ? "18:00" : settings.businessHours.endTime}
              onChange={(e) => update("endTime", e.target.value)}
              className="w-full h-9 px-3 text-xs bg-background border border-border/30 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/30 cursor-pointer font-semibold"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Timezone</Label>
            <select
              value={settings.businessHours.timezone}
              onChange={(e) => update("timezone", e.target.value)}
              className="w-full h-9 px-3 text-xs bg-background border border-border/30 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/30 cursor-pointer font-semibold"
            >
              {timezoneOptions.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Day Schedule list */}
        <div className="space-y-2 text-left pt-2 border-t border-border/10">
          <Label className="text-xs font-bold text-foreground">Weekly Days Schedule</Label>
          <div className="space-y-2">
            {daysOfWeek.map((day) => {
              const active = settings.businessHours.days.includes(day);
              const labelMap: Record<string, string> = {
                Mon: "Monday",
                Tue: "Tuesday",
                Wed: "Wednesday",
                Thu: "Thursday",
                Fri: "Friday",
                Sat: "Saturday",
                Sun: "Sunday"
              };
              return (
                <div 
                  key={day} 
                  className="flex items-center justify-between p-3 border border-border/20 rounded-xl bg-muted/5 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`day-${day}`}
                      checked={active}
                      onChange={() => handleDayToggle(day)}
                      className="h-4 w-4 rounded border-border/30 bg-background text-[#8B5CF6] focus:ring-[#8B5CF6]/30 cursor-pointer"
                    />
                    <Label htmlFor={`day-${day}`} className="text-xs font-bold text-foreground cursor-pointer">
                      {labelMap[day]}
                    </Label>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {active ? `${settings.businessHours.startTime} - ${settings.businessHours.endTime}` : "Closed"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
