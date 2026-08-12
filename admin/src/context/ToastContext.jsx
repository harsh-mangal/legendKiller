import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const iconMap = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message, type = "success", duration = 4500) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => remove(id), duration);
    return id;
  }, [remove]);

  const value = useMemo(() => ({ notify, success: (message) => notify(message, "success"), error: (message) => notify(message, "error"), info: (message) => notify(message, "info") }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-3" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type] || Info;
          return (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <Icon size={19} className="shrink-0" />
              <p className="flex-1 text-sm font-semibold leading-5">{toast.message}</p>
              <button type="button" onClick={() => remove(toast.id)} className="rounded-md p-1 opacity-60 hover:opacity-100" aria-label="Dismiss notification"><X size={16} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used within ToastProvider");
  return value;
};
