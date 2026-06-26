"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"
import { useTheme } from "next-themes"
import { motion, useMotionValue, useTransform, animate } from "motion/react"

import { cn } from "@/lib/utils"

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
  /** When true, the transition expands from the viewport center instead of the button center. */
  fromCenter?: boolean
}

function getThemeTransitionClipPaths(
  cx: number,
  cy: number,
  maxRadius: number
): [string, string] {
  return [
    `circle(0px at ${cx}px ${cy}px)`,
    `circle(${maxRadius}px at ${cx}px ${cy}px)`,
  ]
}

export const AnimatedThemeToggler = ({
  className,
  duration = 450,
  fromCenter = false,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    const button = buttonRef.current
    if (!button) return

    const viewportWidth = window.visualViewport?.width ?? window.innerWidth
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight

    let x: number
    let y: number
    if (fromCenter) {
      x = viewportWidth / 2
      y = viewportHeight / 2
    } else {
      const { top, left, width, height } = button.getBoundingClientRect()
      x = left + width / 2
      y = top + height / 2
    }

    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    )

    const applyTheme = () => {
      const newTheme = resolvedTheme === "dark" ? "light" : "dark"
      setTheme(newTheme)
    }

    // @ts-ignore
    if (typeof document.startViewTransition !== "function") {
      applyTheme()
      return
    }

    const clipPath = getThemeTransitionClipPaths(x, y, maxRadius)

    const root = document.documentElement
    root.dataset.magicuiThemeVt = "active"
    root.style.setProperty(
      "--magicui-theme-toggle-vt-duration",
      `${duration}ms`
    )
    root.style.setProperty("--magicui-theme-vt-clip-from", clipPath[0])
    const cleanup = () => {
      delete root.dataset.magicuiThemeVt
      root.style.removeProperty("--magicui-theme-toggle-vt-duration")
      root.style.removeProperty("--magicui-theme-vt-clip-from")
    }

    // @ts-ignore
    const transition = document.startViewTransition(() => {
      flushSync(applyTheme)
    })
    if (typeof transition?.finished?.finally === "function") {
      transition.finished.finally(cleanup)
    } else {
      cleanup()
    }

    const ready = transition?.ready
    if (ready && typeof ready.then === "function") {
      ready.then(() => {
        document.documentElement.animate(
          {
            clipPath,
          },
          {
            duration,
            easing: "ease-in-out",
            fill: "forwards",
            pseudoElement: "::view-transition-new(root)",
          }
        )
      })
    }
  }, [fromCenter, duration, resolvedTheme, setTheme])

  if (!mounted) {
    return (
      <button
        type="button"
        className={cn(
          "h-8 w-8 text-muted-foreground hover:text-foreground flex items-center justify-center rounded-md hover:bg-muted/50 transition-colors",
          className
        )}
        {...props}
      >
        <Moon className="h-4 w-4" />
      </button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        "h-8 w-8 text-muted-foreground hover:text-foreground flex items-center justify-center rounded-md hover:bg-muted/50 transition-colors cursor-pointer",
        className
      )}
      {...props}
    >
      <SolarSwitch isDark={isDark} />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

const SolarSwitch = ({ isDark }: { isDark: boolean }) => {
  const duration = 0.7;

  const moonVariants = {
    checked: {
      scale: 1,
    },
    unchecked: {
      scale: 0,
    },
  };

  const sunVariants = {
    checked: {
      scale: 0,
    },
    unchecked: {
      scale: 1,
    },
  };

  const scaleMoon = useMotionValue(isDark ? 1 : 0);
  const scaleSun = useMotionValue(isDark ? 0 : 1);
  const pathLengthMoon = useTransform(scaleMoon, [0.6, 1], [0, 1]);
  const pathLengthSun = useTransform(scaleSun, [0.6, 1], [0, 1]);

  useEffect(() => {
    animate(scaleMoon, isDark ? 1 : 0, { duration, ease: [0.16, 1, 0.3, 1] });
    animate(scaleSun, isDark ? 0 : 1, { duration, ease: [0.16, 1, 0.3, 1] });
  }, [isDark, scaleMoon, scaleSun]);

  return (
    <motion.div animate={isDark ? "checked" : "unchecked"} className="flex items-center justify-center">
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-foreground"
      >
        <motion.path
          d="M12.4058 17.7625C15.1672 17.7625 17.4058 15.5239 17.4058 12.7625C17.4058 10.0011 15.1672 7.76251 12.4058 7.76251C9.64434 7.76251 7.40576 10.0011 7.40576 12.7625C7.40576 15.5239 9.64434 17.7625 12.4058 17.7625Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration }}
          style={{
            pathLength: pathLengthSun,
            scale: scaleSun,
          }}
        />
        <motion.path
          d="M12.4058 1.76251V3.76251"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration }}
          style={{
            pathLength: pathLengthSun,
            scale: scaleSun,
          }}
        />
        <motion.path
          d="M12.4058 21.7625V23.7625"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration }}
          style={{
            pathLength: pathLengthSun,
            scale: scaleSun,
          }}
        />
        <motion.path
          d="M4.62598 4.98248L6.04598 6.40248"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration }}
          style={{
            pathLength: pathLengthSun,
            scale: scaleSun,
          }}
        />
        <motion.path
          d="M18.7656 19.1225L20.1856 20.5425"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration }}
          style={{
            pathLength: pathLengthSun,
            scale: scaleSun,
          }}
        />
        <motion.path
          d="M1.40576 12.7625H3.40576"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration }}
          style={{
            pathLength: pathLengthSun,
            scale: scaleSun,
          }}
        />
        <motion.path
          d="M21.4058 12.7625H23.4058"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration }}
          style={{
            pathLength: pathLengthSun,
            scale: scaleSun,
          }}
        />
        <motion.path
          d="M4.62598 20.5425L6.04598 19.1225"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration }}
          style={{
            pathLength: pathLengthSun,
            scale: scaleSun,
          }}
        />
        <motion.path
          d="M18.7656 6.40248L20.1856 4.98248"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={sunVariants}
          custom={isDark}
          transition={{ duration }}
          style={{
            pathLength: pathLengthSun,
            scale: scaleSun,
          }}
        />
        <motion.path
          d="M21.1918 13.2013C21.0345 14.9035 20.3957 16.5257 19.35 17.8781C18.3044 19.2305 16.8953 20.2571 15.2875 20.8379C13.6797 21.4186 11.9398 21.5294 10.2713 21.1574C8.60281 20.7854 7.07479 19.9459 5.86602 18.7371C4.65725 17.5283 3.81774 16.0003 3.4457 14.3318C3.07367 12.6633 3.18451 10.9234 3.76526 9.31561C4.346 7.70783 5.37263 6.29868 6.72501 5.25307C8.07739 4.20746 9.69959 3.56862 11.4018 3.41132C10.4052 4.75958 9.92564 6.42077 10.0503 8.09273C10.175 9.76469 10.8957 11.3364 12.0812 12.5219C13.2667 13.7075 14.8384 14.4281 16.5104 14.5528C18.1823 14.6775 19.8435 14.1979 21.1918 13.2013Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          transition={{ duration }}
          variants={moonVariants}
          custom={isDark}
          style={{
            pathLength: pathLengthMoon,
            scale: scaleMoon,
          }}
        />
      </motion.svg>
    </motion.div>
  );
};;
