import * as React from "react";
import type { ToastProps, ToastActionElement } from "@/components/ui/toast";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type State = {
  toasts: ToasterToast[];
};

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(state: State) {
  memoryState = state;
  listeners.forEach((listener) => listener(state));
}

function addToast(toast: ToasterToast) {
  const updated = {
    toasts: [toast, ...memoryState.toasts].slice(0, TOAST_LIMIT)
  };
  dispatch(updated);
}

function removeToast(toastId: string) {
  const updated = {
    toasts: memoryState.toasts.filter((toast) => toast.id !== toastId)
  };
  dispatch(updated);
}

function scheduleToastRemoval(toastId: string) {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    removeToast(toastId);
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
}

function toast({ ...props }: Omit<ToasterToast, "id">) {
  const id = crypto.randomUUID();
  const toastItem: ToasterToast = {
    id,
    ...props
  };

  addToast(toastItem);
  scheduleToastRemoval(id);

  return {
    id,
    dismiss: () => removeToast(id)
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss: (toastId: string) => removeToast(toastId)
  };
}

export { useToast, toast };

