"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";

export interface ToastInput {
  title: string;
  description?: string;
  tone?: "success" | "error" | "info";
  durationMs?: number;
}

interface ToastRecord extends ToastInput {
  id: number;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = ++counter.current;
      setToasts((current) => [...current.slice(-3), { ...input, id }]);
      window.setTimeout(() => dismiss(id), input.durationMs ?? 4000);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-surface-strong px-4 py-3 text-sm shadow-soft",
              t.tone === "error" && "text-danger",
              t.tone === "success" && "text-success",
            )}
            role="status"
          >
            <Icon name={t.tone === "error" ? "alert" : t.tone === "success" ? "check" : "info"} size={16} className="mt-0.5 shrink-0" />
            <div className="flex-1 text-ink">
              <p className="font-semibold">{t.title}</p>
              {t.description ? <p className="text-ink-muted">{t.description}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="rounded-full p-1 text-ink-faint hover:text-ink"
              aria-label="Dismiss notification"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>.");
  return ctx;
}
