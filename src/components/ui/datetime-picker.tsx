"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isToday,
  isValid
} from "date-fns"

import { cn } from "@/lib/utils/index"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
  value?: string // YYYY-MM-DD or YYYY-MM-DDTHH:MM
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  mode?: "date" | "datetime"
}

export function DateTimePicker({
  value,
  onChange,
  placeholder,
  className,
  mode = "datetime",
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const defaultPlaceholder = mode === "date" ? "Select date..." : "Select date & time..."
  const currentPlaceholder = placeholder || defaultPlaceholder

  // Parse the initial value
  const parsedDate = React.useMemo(() => {
    if (!value) return null
    if (mode === "date") {
      const parts = value.split("-")
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
        return isValid(d) ? d : null
      }
    }
    const date = new Date(value)
    return isValid(date) ? date : null
  }, [value, mode])

  // Current month being viewed in calendar view
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    return parsedDate || new Date()
  })

  // Synchronize calendar view if value changes externally
  React.useEffect(() => {
    if (parsedDate) {
      setCurrentMonth(parsedDate)
    }
  }, [parsedDate])

  // Direction of month switching animation
  const [direction, setDirection] = React.useState(0)

  // Separate states for hour, minute, PM (only relevant for datetime)
  const selectedDate = parsedDate
  const hours = selectedDate ? (selectedDate.getHours() % 12 || 12) : 9
  const minutes = selectedDate ? selectedDate.getMinutes() : 0
  const isPM = selectedDate ? selectedDate.getHours() >= 12 : true

  // Handle month change
  const handlePrevMonth = () => {
    setDirection(-1)
    setCurrentMonth((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setDirection(1)
    setCurrentMonth((prev) => addMonths(prev, 1))
  }

  // Update date-time values
  const handleSelectDay = (day: Date) => {
    if (mode === "date") {
      onChange?.(format(day, "yyyy-MM-dd"))
      setIsOpen(false) // auto-close on day select if in date mode
      return
    }

    const baseDate = day
    let hr = hours
    if (isPM) {
      if (hr < 12) hr += 12
    } else {
      if (hr === 12) hr = 0
    }
    const newDate = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      hr,
      minutes
    )
    onChange?.(format(newDate, "yyyy-MM-dd'T'HH:mm"))
  }

  const handleSelectHour = (h: number) => {
    const baseDate = selectedDate || new Date()
    let hr = h
    if (isPM) {
      if (hr < 12) hr += 12
    } else {
      if (hr === 12) hr = 0
    }
    const newDate = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      hr,
      minutes
    )
    onChange?.(format(newDate, "yyyy-MM-dd'T'HH:mm"))
  }

  const handleSelectMinute = (m: number) => {
    const baseDate = selectedDate || new Date()
    let hr = hours
    if (isPM) {
      if (hr < 12) hr += 12
    } else {
      if (hr === 12) hr = 0
    }
    const newDate = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      hr,
      m
    )
    onChange?.(format(newDate, "yyyy-MM-dd'T'HH:mm"))
  }

  const handleSelectAmPm = (pm: boolean) => {
    const baseDate = selectedDate || new Date()
    let hr = hours
    if (pm) {
      if (hr < 12) hr += 12
    } else {
      if (hr === 12) hr = 0
    }
    const newDate = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      hr,
      minutes
    )
    onChange?.(format(newDate, "yyyy-MM-dd'T'HH:mm"))
  }

  // Shortcuts
  const handleToday = () => {
    const today = new Date()
    if (mode === "date") {
      onChange?.(format(today, "yyyy-MM-dd"))
      setIsOpen(false)
    } else {
      onChange?.(format(today, "yyyy-MM-dd'T'HH:mm"))
    }
    setCurrentMonth(today)
  }

  const handleTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (mode === "date") {
      onChange?.(format(tomorrow, "yyyy-MM-dd"))
      setIsOpen(false)
    } else {
      onChange?.(format(tomorrow, "yyyy-MM-dd'T'HH:mm"))
    }
    setCurrentMonth(tomorrow)
  }

  const handleClear = () => {
    onChange?.("")
  }

  // Generate calendar days
  const days = React.useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    
    const rawInterval = eachDayOfInterval({ start: startDate, end: endDate })
    
    // Ensure we always have exactly 42 days (6 weeks) for consistent UI height
    const gridDays = [...rawInterval]
    while (gridDays.length < 42) {
      const lastDay = gridDays[gridDays.length - 1]
      const nextDay = new Date(lastDay)
      nextDay.setDate(nextDay.getDate() + 1)
      gridDays.push(nextDay)
    }
    return gridDays
  }, [currentMonth])

  // Framer Motion variants for calendar transition
  const calendarVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -20 : 20,
      opacity: 0,
    }),
  }

  // Refs for auto scrolling lists
  const hourScrollRef = React.useRef<HTMLDivElement>(null)
  const minuteScrollRef = React.useRef<HTMLDivElement>(null)

  // Scroll active elements into view on open
  React.useEffect(() => {
    if (isOpen && mode === "datetime") {
      setTimeout(() => {
        if (hourScrollRef.current) {
          const activeHour = hourScrollRef.current.querySelector('[data-active="true"]')
          if (activeHour) {
            activeHour.scrollIntoView({ block: "center", behavior: "auto" })
          }
        }
        if (minuteScrollRef.current) {
          const activeMinute = minuteScrollRef.current.querySelector('[data-active="true"]')
          if (activeMinute) {
            activeMinute.scrollIntoView({ block: "center", behavior: "auto" })
          }
        }
      }, 80)
    }
  }, [isOpen, mode])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 text-xs bg-background border border-border/30 rounded-lg hover:border-[#8B5CF6]/50 hover:bg-muted/10 transition-colors focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] text-left cursor-pointer select-none",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {selectedDate
              ? format(selectedDate, mode === "date" ? "dd-MM-yyyy" : "dd-MM-yyyy hh:mm a")
              : currentPlaceholder}
          </span>
          <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      
      <PopoverContent
        align="start"
        className="w-auto p-0 border border-border/40 bg-popover shadow-xl rounded-2xl overflow-hidden focus:outline-none"
      >
        <div className="flex divide-x divide-border/20">
          {/* Calendar Side */}
          <div className="p-4 w-[280px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg border border-border/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="text-xs font-bold text-foreground">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg border border-border/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase text-muted-foreground/50 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>
            
            {/* Days Grid */}
            <div className="relative overflow-hidden h-[180px]">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={currentMonth.toISOString()}
                  custom={direction}
                  variants={calendarVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="grid grid-cols-7 gap-1"
                >
                  {days.map((day) => {
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                    const isCurrMonth = isSameMonth(day, currentMonth)
                    const isTodayDate = isToday(day)
                    
                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        onClick={() => handleSelectDay(day)}
                        className={cn(
                          "relative h-7 w-7 rounded-lg text-[11px] flex items-center justify-center transition-all cursor-pointer hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6] focus:outline-none select-none",
                          !isCurrMonth && "text-muted-foreground/30 hover:text-muted-foreground/50",
                          isCurrMonth && !isSelected && "text-foreground",
                          isTodayDate && !isSelected && "ring-1 ring-[#8B5CF6]/50 text-[#8B5CF6] font-bold"
                        )}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="activeDay"
                            className="absolute inset-0 bg-gradient-to-tr from-[#8B5CF6] to-[#7C3AED] rounded-lg shadow-sm shadow-[#8B5CF6]/30 z-0"
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                          />
                        )}
                        <span className={cn("relative z-10 font-semibold", isSelected && "text-white font-bold")}>
                          {format(day, "d")}
                        </span>
                      </button>
                    )
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Shortcuts */}
            <div className="flex items-center justify-between border-t border-border/20 pt-3 mt-3">
              <button
                type="button"
                onClick={handleToday}
                className="text-[10px] font-bold text-[#8B5CF6] hover:underline cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleTomorrow}
                className="text-[10px] font-bold text-[#8B5CF6] hover:underline cursor-pointer"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
          
          {/* Time Picker Side (Only rendered if mode is datetime) */}
          {mode === "datetime" && (
            <div className="p-4 w-[140px] flex flex-col h-[280px]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-3 px-1">
                <Clock className="h-3.5 w-3.5 text-[#8B5CF6]" />
                <span>Time</span>
              </div>
              
              <div className="flex-1 flex gap-2 overflow-hidden min-h-0">
                {/* Hours Scroll */}
                <div
                  ref={hourScrollRef}
                  className="flex-1 overflow-y-auto scroll-smooth space-y-1 pr-0.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                    const isActive = hours === h
                    return (
                      <button
                        key={h}
                        type="button"
                        data-active={isActive}
                        onClick={() => handleSelectHour(h)}
                        className={cn(
                          "w-full text-center py-1 text-[11px] rounded-md transition-all font-semibold cursor-pointer select-none",
                          isActive
                            ? "bg-[#8B5CF6]/15 text-[#8B5CF6] font-bold"
                            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        )}
                      >
                        {String(h).padStart(2, "0")}
                      </button>
                    )
                  })}
                </div>
                
                {/* Minutes Scroll */}
                <div
                  ref={minuteScrollRef}
                  className="flex-1 overflow-y-auto scroll-smooth space-y-1 pr-0.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full"
                >
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => {
                    const isActive = minutes === m
                    return (
                      <button
                        key={m}
                        type="button"
                        data-active={isActive}
                        onClick={() => handleSelectMinute(m)}
                        className={cn(
                          "w-full text-center py-1 text-[11px] rounded-md transition-all font-semibold cursor-pointer select-none",
                          isActive
                            ? "bg-[#8B5CF6]/15 text-[#8B5CF6] font-bold"
                            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        )}
                      >
                        {String(m).padStart(2, "0")}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* AM/PM Selector */}
              <div className="grid grid-cols-2 gap-1 border-t border-border/20 pt-3 mt-3">
                <button
                  type="button"
                  onClick={() => handleSelectAmPm(false)}
                  className={cn(
                    "py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer select-none",
                    !isPM
                      ? "bg-[#8B5CF6] text-white border-transparent"
                      : "border-border/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAmPm(true)}
                  className={cn(
                    "py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer select-none",
                    isPM
                      ? "bg-[#8B5CF6] text-white border-transparent"
                      : "border-border/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  PM
                </button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
