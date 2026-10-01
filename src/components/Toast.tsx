"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (message: string, type: ToastType, duration?: number) => void;
  dismiss: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle size={16} className="shrink-0" />,
  error: <AlertCircle size={16} className="shrink-0" />,
  warning: <AlertTriangle size={16} className="shrink-0" />,
  info: <Info size={16} className="shrink-0" />,
};

const styles: Record<ToastType, string> = {
  success: "border-green-400/30 bg-green-400/10 text-green-200",
  error: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  info: "border-sky-400/30 bg-sky-400/10 text-sky-200",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 animate-in slide-in-from-right-full duration-200",
        styles[toast.type]
      )}
      role="alert"
    >
      <div className="flex-shrink-0 text-current">{icons[toast.type]}</div>
      <p className="text-xs leading-snug flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-0.5 text-current/60 hover:text-current transition"
        aria-label="Dismiss"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  const helpers = useMemo(() => ({
    success: (message: string, duration?: number) => toast(message, "success", duration),
    error: (message: string, duration?: number) => toast(message, "error", duration),
    warning: (message: string, duration?: number) => toast(message, "warning", duration),
    info: (message: string, duration?: number) => toast(message, "info", duration),
  }), [toast]);

  const contextValue = useMemo(
    () => ({ toasts, toast, dismiss, ...helpers }),
    [toasts, toast, dismiss, helpers],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-1.5 max-w-xs w-full pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}