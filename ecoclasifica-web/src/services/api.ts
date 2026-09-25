// Cliente HTTP para comunicarse con el backend (server/index.js)
// - En el navegador (web) se usa la misma URL de la página: Vite redirige
//   "/api/*" hacia Express, así que BASE_URL queda vacío.
// - En las apps nativas (Android / iOS) no hay proxy, así que se usa la URL
//   del servidor definida en el archivo .env (VITE_API_URL).
//   Ej.: VITE_API_URL=http://192.168.1.68:4000  o  https://mi-api.onrender.com

import { Capacitor } from "@capacitor/core";

const URL_SERVIDOR_NATIVO =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ??
  "http://192.168.1.68:4000";

const BASE_URL = Capacitor.isNativePlatform() ? URL_SERVIDOR_NATIVO : "";

async function solicitar<T>(
  ruta: string,
  opciones?: RequestInit
): Promise<T> {

  const respuesta = await fetch(`${BASE_URL}/api${ruta}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...opciones,
  });

  if (!respuesta.ok) {
    throw new Error(
      `Error de red (${respuesta.status}) al llamar ${ruta}`
    );
  }

  return respuesta.json() as Promise<T>;
}


export const api = {

  get: <T>(ruta: string) =>
    solicitar<T>(ruta),

  post: <T>(ruta: string, cuerpo?: unknown) =>
    solicitar<T>(ruta, {
      method: "POST",
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    }),

  put: <T>(ruta: string, cuerpo?: unknown) =>
    solicitar<T>(ruta, {
      method: "PUT",
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    }),

  del: <T>(ruta: string) =>
    solicitar<T>(ruta, {
      method: "DELETE",
    }),

};