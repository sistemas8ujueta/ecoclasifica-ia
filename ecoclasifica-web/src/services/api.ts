// Cliente HTTP mínimo para hablar con el backend (server/index.js). En
// desarrollo, Vite redirige "/api/*" al servidor Express en el puerto 4000
// (ver vite.config.ts), así que esto funciona igual desde localhost que
// desde la IP de la red local (el celular).

async function solicitar<T>(ruta: string, opciones?: RequestInit): Promise<T> {
  const respuesta = await fetch(`/api${ruta}`, {
    headers: { "Content-Type": "application/json" },
    ...opciones,
  });
  if (!respuesta.ok) {
    throw new Error(`Error de red (${respuesta.status}) al llamar ${ruta}`);
  }
  return respuesta.json() as Promise<T>;
}

export const api = {
  get: <T>(ruta: string) => solicitar<T>(ruta),
  post: <T>(ruta: string, cuerpo?: unknown) =>
    solicitar<T>(ruta, { method: "POST", body: cuerpo ? JSON.stringify(cuerpo) : undefined }),
  put: <T>(ruta: string, cuerpo?: unknown) =>
    solicitar<T>(ruta, { method: "PUT", body: cuerpo ? JSON.stringify(cuerpo) : undefined }),
  del: <T>(ruta: string) => solicitar<T>(ruta, { method: "DELETE" }),
};
