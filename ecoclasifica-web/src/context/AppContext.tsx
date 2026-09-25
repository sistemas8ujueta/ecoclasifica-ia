import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  ResultadoDeteccion,
  UsuarioSesion,
} from "../types";

import type { CanecaId } from "../data/canecas";

const CLAVE_SESION = "ecoclasifica_sesion";

interface AppContextValor {
  sesion: UsuarioSesion | null;

  iniciarSesion: (
    usuario: UsuarioSesion
  ) => void;

  cerrarSesion: () => void;

  actualizarSesion: (
    cambios: Partial<UsuarioSesion>
  ) => void;

  ultimoResultado: ResultadoDeteccion | null;

  ultimaImagen: string | null;

  guardarResultadoEscaneo: (
    resultado: ResultadoDeteccion,
    imagen: string | null
  ) => void;

  actualizarCanecaResultado: (
    caneca: CanecaId
  ) => void;
}

const AppContext =
  createContext<AppContextValor | null>(
    null
  );

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [sesion, setSesion] =
    useState<UsuarioSesion | null>(() => {
      try {
        const crudo =
          localStorage.getItem(
            CLAVE_SESION
          );

        return crudo
          ? (JSON.parse(
              crudo
            ) as UsuarioSesion)
          : null;
      } catch {
        return null;
      }
    });

  const [
    ultimoResultado,
    setUltimoResultado,
  ] =
    useState<ResultadoDeteccion | null>(
      null
    );

  const [
    ultimaImagen,
    setUltimaImagen,
  ] =
    useState<string | null>(null);

  useEffect(() => {
    if (sesion) {
      localStorage.setItem(
        CLAVE_SESION,
        JSON.stringify(sesion)
      );
    } else {
      localStorage.removeItem(
        CLAVE_SESION
      );
    }
  }, [sesion]);

  function actualizarCanecaResultado(
    caneca: CanecaId
  ) {
    setUltimoResultado(
      (resultadoActual) => {
        if (!resultadoActual) {
          return resultadoActual;
        }

        return {
          ...resultadoActual,
          caneca,
        };
      }
    );
  }

  const valor: AppContextValor = {
    sesion,

    iniciarSesion: setSesion,

    cerrarSesion: () =>
      setSesion(null),

    actualizarSesion: (cambios) =>
      setSesion((actual) =>
        actual
          ? {
              ...actual,
              ...cambios,
            }
          : actual
      ),

    ultimoResultado,

    ultimaImagen,

    guardarResultadoEscaneo: (
      resultado,
      imagen
    ) => {
      setUltimoResultado(resultado);
      setUltimaImagen(imagen);
    },

    actualizarCanecaResultado,
  };

  return (
    <AppContext.Provider
      value={valor}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValor {
  const contexto =
    useContext(AppContext);

  if (!contexto) {
    throw new Error(
      "useApp debe usarse dentro de <AppProvider>"
    );
  }

  return contexto;
}