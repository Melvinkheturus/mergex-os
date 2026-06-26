"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useParams, useRouter } from "next/navigation";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { TOUR_CONFIGS, TourStep } from "@/config/tours";
import { toast } from "sonner";

interface OnboardingContextType {
  loading: boolean;
  firstLogin: boolean;
  completedTours: string[];
  activeTourId: string | null;
  activeStepIndex: number;
  startTour: (tourId: string, force?: boolean) => void;
  resetAllTours: () => Promise<void>;
  showFeatureSpotlight: (options: {
    title: string;
    description: string;
    selector: string;
    spotlightId: string;
  }) => Promise<void>;
  dismissTour: (tourId: string) => Promise<void>;
  runCurrentPageTour: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Helper to wait for a DOM element to be available (for lazy-loaded content)
const waitForElement = (selector: string, timeout = 1500): Promise<Element | null> => {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(interval);
        resolve(el);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        resolve(null);
      }
    }, 100);
  });
};

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";

  const [loading, setLoading] = useState(true);
  const [firstLogin, setFirstLogin] = useState(false);
  const [completedTours, setCompletedTours] = useState<string[]>([]);
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Keep a ref to track programmatic destroys vs. manual closes
  const isProgrammaticDestroyRef = useRef(false);
  const driverInstanceRef = useRef<any>(null);

  // 1. Fetch onboarding state on load
  const fetchOnboardingState = useCallback(async () => {
    let localCompleted: string[] = [];
    try {
      localCompleted = JSON.parse(localStorage.getItem("mergex_completed_tours") || "[]");
    } catch (e) {}

    try {
      const res = await fetch("/api/onboarding");
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setFirstLogin(data.firstLogin);
          const combined = Array.from(new Set([...(data.completedTours || []), ...localCompleted]));
          setCompletedTours(combined);
          localStorage.setItem("mergex_completed_tours", JSON.stringify(combined));
          return;
        }
      }
    } catch (error) {
      console.error("Failed to load onboarding state:", error);
    } finally {
      setLoading(false);
    }

    // Fallback if API fails
    setCompletedTours(localCompleted);
    setFirstLogin(!localCompleted.includes("first-login"));
  }, []);

  useEffect(() => {
    fetchOnboardingState();
  }, [fetchOnboardingState]);

  // 2. Mark a tour complete on the backend & local state
  const dismissTour = useCallback(async (tourId: string) => {
    // Update local state first (optimistic UI)
    setCompletedTours((prev) => {
      const updated = [...prev.filter((id) => id !== tourId), tourId];
      try {
        localStorage.setItem("mergex_completed_tours", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (tourId === "first-login") {
      setFirstLogin(false);
    }

    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", tourId }),
      });
    } catch (error) {
      console.error(`Failed to mark tour ${tourId} completed on server:`, error);
    }
  }, []);

  // 3. Reset all tours (Help & Onboarding controls)
  const resetAllTours = useCallback(async () => {
    // Optimistically update client state first
    setCompletedTours([]);
    setFirstLogin(true);
    setActiveTourId(null);
    setActiveStepIndex(0);
    localStorage.removeItem("mergex_active_tour");
    localStorage.removeItem("mergex_active_step");
    localStorage.setItem("mergex_completed_tours", JSON.stringify([]));

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      if (res.ok) {
        toast.success("Walkthroughs reset successfully!");
        // Redirect to dashboard to trigger first login walkthrough
        if (slug) {
          router.push(`/workspaces/${slug}/dashboard`);
        }
      }
    } catch (error) {
      console.error("Failed to reset tours:", error);
      toast.success("Walkthroughs reset successfully on client.");
      if (slug) {
        router.push(`/workspaces/${slug}/dashboard`);
      }
    }
  }, [slug, router]);

  // 4. Run a single step of the tour
  const runTourStep = useCallback(
    async (tourId: string, stepIndex: number) => {
      const steps = TOUR_CONFIGS[tourId];
      if (!steps) return;

      // Map steps to current slug
      const mappedSteps = steps.map((s) => ({
        ...s,
        route: s.route.replace("[slug]", slug),
      }));

      const step = mappedSteps[stepIndex];
      if (!step) {
        // We reached the end of the tour!
        dismissTour(tourId);
        setActiveTourId(null);
        setActiveStepIndex(0);
        localStorage.removeItem("mergex_active_tour");
        localStorage.removeItem("mergex_active_step");
        toast.success("Walkthrough completed!");
        return;
      }

      // If we are not on the correct route, redirect and let the next page load handle it
      if (pathname !== step.route) {
        setActiveTourId(tourId);
        setActiveStepIndex(stepIndex);
        localStorage.setItem("mergex_active_tour", tourId);
        localStorage.setItem("mergex_active_step", String(stepIndex));
        isProgrammaticDestroyRef.current = true;
        if (driverInstanceRef.current) {
          driverInstanceRef.current.destroy();
        }
        router.push(step.route);
        return;
      }

      // Wait for element to load in DOM
      const targetElement = await waitForElement(step.element, 1500);

      if (!targetElement) {
        console.warn(`[Guided Walkthrough] Element '${step.element}' not found. Skipping step.`);
        // Gracefully skip to next step
        const nextIdx = stepIndex + 1;
        runTourStep(tourId, nextIdx);
        return;
      }

      const hasNext = stepIndex + 1 < mappedSteps.length;
      const hasPrev = stepIndex > 0;

      // Initialize Driver.js for this single step
      const d = driver({
        allowClose: true,
        animate: true,
        overlayColor: "rgba(0, 0, 0, 0.4)",
        steps: [
          {
            element: step.element,
            popover: {
              title: step.title,
              description: step.description,
              side: step.side || "bottom",
              align: step.align || "center",
              nextBtnText: hasNext ? "Next" : "Finish",
              prevBtnText: hasPrev ? "Back" : undefined,
              showButtons: ["next", "previous", "close"],
            },
          },
        ],
        onNextClick: () => {
          isProgrammaticDestroyRef.current = true;
          d.destroy();
          runTourStep(tourId, stepIndex + 1);
        },
        onPrevClick: () => {
          isProgrammaticDestroyRef.current = true;
          d.destroy();
          runTourStep(tourId, stepIndex - 1);
        },
        onDestroyed: () => {
          driverInstanceRef.current = null;
          // If the user manually clicked close/overlay (not programmatic transition)
          if (!isProgrammaticDestroyRef.current) {
            setActiveTourId(null);
            setActiveStepIndex(0);
            localStorage.removeItem("mergex_active_tour");
            localStorage.removeItem("mergex_active_step");
            // Mark the tour complete/dismissed so it doesn't auto-start again
            dismissTour(tourId);
          }
          isProgrammaticDestroyRef.current = false;
        },
      });

      driverInstanceRef.current = d;
      d.drive();
    },
    [slug, pathname, router, dismissTour]
  );

  // 5. Trigger a tour (manual or forced)
  const startTour = useCallback(
    (tourId: string, force = false) => {
      if (!slug) return;
      if (completedTours.includes(tourId) && !force) return;

      setActiveTourId(tourId);
      setActiveStepIndex(0);
      localStorage.setItem("mergex_active_tour", tourId);
      localStorage.setItem("mergex_active_step", "0");
      runTourStep(tourId, 0);
    },
    [slug, completedTours, runTourStep]
  );

  // 6. Feature Spotlight callout
  const showFeatureSpotlight = useCallback(
    async ({
      title,
      description,
      selector,
      spotlightId,
    }: {
      title: string;
      description: string;
      selector: string;
      spotlightId: string;
    }) => {
      if (completedTours.includes(spotlightId)) return;

      const target = await waitForElement(selector, 2000);
      if (!target) {
        console.warn(`[Spotlight] Target element '${selector}' not found.`);
        return;
      }

      const d = driver({
        allowClose: true,
        animate: true,
        overlayColor: "rgba(0, 0, 0, 0.45)",
        steps: [
          {
            element: selector,
            popover: {
              title,
              description,
              side: "bottom",
              align: "center",
              nextBtnText: "Got it",
              showButtons: ["next"],
            },
          },
        ],
        onNextClick: () => {
          d.destroy();
          dismissTour(spotlightId);
        },
        onDestroyed: () => {
          dismissTour(spotlightId);
        },
      });

      d.drive();
    },
    [completedTours, dismissTour]
  );

  // 7. Click "?" button triggers tour of the current page module
  const runCurrentPageTour = useCallback(() => {
    if (!slug) return;
    
    // Determine tour based on active path
    let targetTour = "";
    if (pathname.includes("/crm/leads")) {
      targetTour = "crm";
    } else if (pathname.endsWith("/dashboard")) {
      targetTour = "dashboard";
    } else if (pathname.includes("/clients")) {
      targetTour = "clients";
    } else if (pathname.includes("/documents")) {
      targetTour = "documents";
    } else if (pathname.includes("/knowledge")) {
      targetTour = "knowledge";
    } else if (pathname.includes("/settings")) {
      targetTour = "settings";
    }

    if (targetTour && TOUR_CONFIGS[targetTour]) {
      startTour(targetTour, true); // Force run it
    } else {
      toast.info("Guided Walkthrough is not configured for this screen.");
    }
  }, [slug, pathname, startTour]);

  // 8. Auto-resume active tours across page reloads/routing
  useEffect(() => {
    if (loading || !slug) return;

    const savedTourId = localStorage.getItem("mergex_active_tour");
    const savedStepIdxStr = localStorage.getItem("mergex_active_step");

    if (savedTourId && savedStepIdxStr !== null) {
      const savedStepIdx = parseInt(savedStepIdxStr, 10);
      setActiveTourId(savedTourId);
      setActiveStepIndex(savedStepIdx);
      
      // Resume the tour on page load
      const timer = setTimeout(() => {
        runTourStep(savedTourId, savedStepIdx);
      }, 500); // Give page a short moment to render
      
      return () => clearTimeout(timer);
    }
  }, [loading, slug, runTourStep]);

  // 9. Auto-start tours for first login and module access
  useEffect(() => {
    if (loading || activeTourId || !slug) return;

    // Check if First Login Walkthrough is needed
    if (firstLogin && !completedTours.includes("first-login")) {
      // Direct user to Dashboard to start the walkthrough
      const targetPath = `/workspaces/${slug}/dashboard`;
      if (pathname !== targetPath) {
        router.push(targetPath);
      } else {
        startTour("first-login");
      }
      return;
    }

    // Otherwise, check if current page has a module tour that hasn't been completed yet
    if (!firstLogin) {
      const timer = setTimeout(() => {
        if (pathname.includes("/crm/leads") && !completedTours.includes("crm")) {
          startTour("crm");
        } else if (pathname.endsWith("/dashboard") && !completedTours.includes("dashboard")) {
          startTour("dashboard");
        }
      }, 1500); // Wait a bit after load to start automatically so they aren't jarred immediately
      return () => clearTimeout(timer);
    }
  }, [loading, slug, pathname, firstLogin, completedTours, activeTourId, startTour, router]);

  return (
    <OnboardingContext.Provider
      value={{
        loading,
        firstLogin,
        completedTours,
        activeTourId,
        activeStepIndex,
        startTour,
        resetAllTours,
        showFeatureSpotlight,
        dismissTour,
        runCurrentPageTour,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useTour() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useTour must be used within an OnboardingProvider");
  }
  return context;
}
