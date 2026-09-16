import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { IconCheck, IconWarning } from "./icons";
import "./Toast.css";

type Variante = "exito" | "error";
interface ToastItem { id: number; mensaje: string; variante: Variante }

interface ToastContextValor {
  mostrarToast: (mensaje: string, variante?: Variante) => void;
}

const ToastContext = createContext<ToastContextValor | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const contador = useRef(0);

  const mostrarToast = useCallback((mensaje: string, variante: Variante = "exito") => {
    const id = ++contador.current;
    setToasts((actual) => [...actual, { id, mensaje, variante }]);
    setTimeout(() => setToasts((actual) => actual.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      <div className="toast-contenedor">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.variante}`}>
            {t.variante === "exito" ? <IconCheck size={16} /> : <IconWarning size={16} />}
            <span>{t.mensaje}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValor {
  const contexto = useContext(ToastContext);
  if (!contexto) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return contexto;
}
